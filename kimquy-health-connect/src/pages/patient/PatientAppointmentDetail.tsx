import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import { generateTimeSlots, type Appointment, type MedicalRecord } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { cancelAppointment, createAppointment, getAppointment, getPatientMedicalRecords } from '../../services/healthApi';
import { sendNotification } from '../../services/notificationService';
import dashStyles from './PatientDashboard.module.css';
import styles from './PatientAppointmentDetail.module.css';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ duyệt', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Đã khám', CANCELLED: 'Đã hủy',
};

const PatientAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  // State giả lập (vì dữ liệu mock không persist)
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const appt = await getAppointment(Number(id));
        setAppointment(appt);
        if (profile?.id) {
          const records = await getPatientMedicalRecords(profile.id).catch(() => []);
          setRecord(records.find((r) => r.appointmentId === Number(id)) || null);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, profile?.id]);

  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  if (loading) {
    return (
      <DashboardLayout sections={patientSidebar}>
        <h1 className={dashStyles.pageTitle}>Đang tải dữ liệu...</h1>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout sections={patientSidebar}>
        <h1 className={dashStyles.pageTitle}>Không tìm thấy lịch hẹn</h1>
        <Link to="/patient/appointments"><button className={`${styles.btn} ${styles.btnPrimary}`}>← Quay lại</button></Link>
      </DashboardLayout>
    );
  }

  const status = localStatus ?? appointment.status;
  const date = localDate ?? appointment.appointmentDate;
  const time = localTime ?? appointment.startTime;
  const canModify = status === 'PENDING' || status === 'CONFIRMED';

  const handleCancel = () => {
    if (!cancelReason.trim()) { alert('Vui lòng nhập lý do hủy'); return; }
    cancelAppointment(appointment.id).catch(() => null);
    setLocalStatus('CANCELLED');
    setShowCancel(false);
    sendNotification({
      event: 'APPOINTMENT_CANCELLED',
      channels: ['EMAIL', 'SMS'],
      email: 'patient@kimquy.vn',
      phone: '+84900000001',
      context: { patientName: 'Bạn', doctorName: appointment!.doctorName, date, time, reason: cancelReason },
    });
  };

  const handleReschedule = () => {
    if (!newDate || !newTime || !profile?.id) { alert('Vui lòng chọn ngày và giờ mới'); return; }
    const doctorId = String(appointment.doctorId);
    createAppointment(profile.id, doctorId, {
      appointmentDate: newDate,
      startTime: `${newTime}:00`,
      reason: appointment.reason,
      appointmentType: appointment.appointmentType,
    })
      .then(async () => {
        await cancelAppointment(appointment.id).catch(() => null);
        setLocalDate(newDate);
        setLocalTime(newTime);
        setLocalStatus('PENDING');
      })
      .finally(() => setShowReschedule(false));
    sendNotification({
      event: 'APPOINTMENT_RESCHEDULED',
      channels: ['EMAIL', 'SMS'],
      email: 'patient@kimquy.vn',
      phone: '+84900000001',
      context: { patientName: 'Bạn', doctorName: appointment!.doctorName, date: newDate, time: newTime },
    });
  };

  const slots = useMemo(() => generateTimeSlots(newDate), [newDate]);

  return (
    <DashboardLayout sections={patientSidebar}>
      <button onClick={() => navigate(-1)} className={`${styles.btn} ${styles.btnOutline}`} style={{ marginBottom: '1rem', width: 'auto' }}>
        <FiArrowLeft style={{ marginRight: 6 }} />Quay lại
      </button>
      <h1 className={dashStyles.pageTitle}>Chi tiết lịch hẹn #{appointment.id}</h1>

      <div className={styles.wrapper}>
        <div>
          <div className={styles.card}>
            <div className={styles.docHeader}>
              <img src={appointment.doctorAvatar} alt={appointment.doctorName} />
              <div>
                <div className={styles.docName}>{appointment.doctorName}</div>
                <div className={styles.docSpec}>{appointment.specialtyName}</div>
              </div>
            </div>
            <div className={styles.row}><span className={styles.label}><FiCalendar style={{ marginRight: 6 }} />Ngày khám</span><span className={styles.value}>{date}</span></div>
            <div className={styles.row}><span className={styles.label}><FiClock style={{ marginRight: 6 }} />Giờ khám</span><span className={styles.value}>{time} - {appointment.endTime}</span></div>
            {appointment.queueNumber != null && (
              <div className={styles.row}><span className={styles.label}>Số thứ tự</span><span className={styles.value} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>#{appointment.queueNumber}</span></div>
            )}
            <div className={styles.row}><span className={styles.label}>Loại khám</span><span className={styles.value}>{appointment.appointmentType === 'REVISIT' ? 'Tái khám' : 'Khám lần đầu'}</span></div>
            <div className={styles.row}><span className={styles.label}>Dịch vụ</span><span className={styles.value}>{appointment.serviceName}</span></div>
            <div className={styles.row}><span className={styles.label}>Trạng thái</span><span className={`status-badge status-badge--${status.toLowerCase()}`}>{statusLabel[status]}</span></div>
            <div className={styles.row}><span className={styles.label}><FiMapPin style={{ marginRight: 6 }} />Địa điểm</span><span className={styles.value}>Phòng khám Kim Quy</span></div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Lý do khám</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', margin: 0 }}>{appointment.reason}</p>
            {appointment.notes && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}><strong>Ghi chú:</strong> {appointment.notes}</p>}
          </div>

          {record && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Kết quả khám</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
              <Link to={`/patient/medical-records/${record.id}`}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto' }}>Xem hồ sơ chi tiết</button>
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Hành động</div>
            <div className={styles.actions}>
              {canModify && (
                <>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowReschedule(true)}>Đổi lịch hẹn</button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setShowCancel(true)}>Hủy lịch hẹn</button>
                </>
              )}
              {status === 'COMPLETED' && (
                <Link to="/patient/reviews"><button className={`${styles.btn} ${styles.btnOutline}`} style={{ width: '100%' }}>Đánh giá bác sĩ</button></Link>
              )}
              {status === 'CANCELLED' && (
                <Link to="/patient/booking"><button className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>Đặt lịch mới</button></Link>
              )}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Liên hệ hỗ trợ</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hotline: <strong>1900 1234</strong></p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email: support@kimquy.vn</p>
          </div>
        </div>
      </div>

      {showCancel && (
        <div className={styles.modalOverlay} onClick={() => setShowCancel(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>Xác nhận hủy lịch hẹn</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Bạn có chắc muốn hủy lịch khám với <strong>{appointment.doctorName}</strong> ngày {date} lúc {time}?</p>
            <div className={styles.field}>
              <label>Lý do hủy *</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy lịch..." />
            </div>
            <div className={styles.modalActions}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowCancel(false)}>Đóng</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleCancel}>Xác nhận hủy</button>
            </div>
          </div>
        </div>
      )}

      {showReschedule && (
        <div className={styles.modalOverlay} onClick={() => setShowReschedule(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>Đổi lịch hẹn</div>
            <div className={styles.field}>
              <label>Ngày khám mới *</label>
              <input type="date" value={newDate} onChange={(e) => { setNewDate(e.target.value); setNewTime(''); }} min={new Date().toISOString().split('T')[0]} />
            </div>
            {newDate && (
              <div className={styles.field}>
                <label>Khung giờ *</label>
                <div className={styles.timeGrid}>
                  {slots.map((s) => (
                    <div
                      key={s.time}
                      className={`${styles.timeSlot} ${newTime === s.time ? styles.timeSlotActive : ''} ${!s.available ? styles.timeSlotDisabled : ''}`}
                      onClick={() => s.available && setNewTime(s.time)}
                    >{s.time}</div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowReschedule(false)}>Đóng</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleReschedule}>Gửi yêu cầu</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientAppointmentDetail;
