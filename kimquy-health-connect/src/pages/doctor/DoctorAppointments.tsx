import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiEye, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import { type Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { createMedicalRecord, getDoctorAppointments, updateAppointmentStatus } from '../../services/healthApi';
import { sendNotification } from '../../services/notificationService';
import styles from './DoctorAppointments.module.css';

type StatusFilter = 'ALL' | Appointment['status'];

const statusLabels: Record<StatusFilter, string> = {
  ALL: 'Tất cả',
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã khám',
  CANCELLED: 'Đã hủy',
};

const statusBadgeClass: Record<Appointment['status'], string> = {
  PENDING: 'status-badge status-badge--pending',
  CONFIRMED: 'status-badge status-badge--confirmed',
  COMPLETED: 'status-badge status-badge--completed',
  CANCELLED: 'status-badge status-badge--cancelled',
};

const DoctorAppointments = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Medical record state
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [prescription, setPrescription] = useState<{ name: string; dosage: string; days: string; note: string }[]>(
    [{ name: '', dosage: '', days: '', note: '' }]
  );

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getDoctorAppointments(profile.id).catch(() => []);
      setAppts(data);
    };

    load();
  }, [profile?.id]);

  const filtered = filter === 'ALL' ? appts : appts.filter(a => a.status === filter);

  const approveAppt = (appt: Appointment) => {
    updateAppointmentStatus(appt.id, 'CONFIRMED').catch(() => null);
    setAppts(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'CONFIRMED' } : a));
    sendNotification({
      event: 'APPOINTMENT_CONFIRMED',
      channels: ['EMAIL', 'SMS'],
      email: `patient${appt.patientId}@kimquy.vn`,
      phone: `+8490000${String(appt.patientId).padStart(4, '0')}`,
      context: { patientName: `BN #${appt.patientId}`, doctorName: appt.doctorName, date: appt.appointmentDate, time: `${appt.startTime}-${appt.endTime}` },
    });
  };

  const openReject = (appt: Appointment) => {
    setSelectedAppt(appt);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedAppt) {
      updateAppointmentStatus(selectedAppt.id, 'CANCELLED').catch(() => null);
      setAppts(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: 'CANCELLED', notes: rejectReason } : a));
      sendNotification({
        event: 'APPOINTMENT_CANCELLED',
        channels: ['EMAIL', 'SMS'],
        email: `patient${selectedAppt.patientId}@kimquy.vn`,
        phone: `+8490000${String(selectedAppt.patientId).padStart(4, '0')}`,
        context: { patientName: `BN #${selectedAppt.patientId}`, doctorName: selectedAppt.doctorName, date: selectedAppt.appointmentDate, time: `${selectedAppt.startTime}-${selectedAppt.endTime}`, reason: rejectReason },
      });
    }
    setShowRejectModal(false);
  };

  const openDetail = (appt: Appointment) => {
    setSelectedAppt(appt);
    setDiagnosis('');
    setIcdCode('');
    setConclusion('');
    setPrescription([{ name: '', dosage: '', days: '', note: '' }]);
    setShowDetailModal(true);
  };

  const completeAppt = () => {
    if (selectedAppt) {
      if (profile?.id) {
        const noteBlock = [
          conclusion ? `Ket luan: ${conclusion}` : '',
          icdCode ? `ICD: ${icdCode}` : '',
          prescription
            .filter((p) => p.name)
            .map((p) => `${p.name} | ${p.dosage} | ${p.days} ngay | ${p.note}`)
            .join('\n'),
        ].filter(Boolean).join('\n');

        createMedicalRecord({
          title: selectedAppt.serviceName || 'Kham benh',
          date: selectedAppt.appointmentDate,
          status: 'COMPLETED',
          diagnosis: diagnosis || 'Da kham',
          notes: noteBlock,
          patientId: String(selectedAppt.patientId),
          doctorId: profile.id,
          appointmentId: selectedAppt.id,
        }).catch(() => null);
      }

      updateAppointmentStatus(selectedAppt.id, 'COMPLETED').catch(() => null);
      setAppts(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: 'COMPLETED' } : a));
      sendNotification({
        event: 'MEDICAL_RECORD_READY',
        channels: ['EMAIL', 'SMS'],
        email: `patient${selectedAppt.patientId}@kimquy.vn`,
        phone: `+8490000${String(selectedAppt.patientId).padStart(4, '0')}`,
        context: { patientName: `BN #${selectedAppt.patientId}`, doctorName: selectedAppt.doctorName, date: selectedAppt.appointmentDate, diagnosis: diagnosis || 'Đã có kết quả' },
      });
    }
    setShowDetailModal(false);
  };

  const updatePrescription = (idx: number, field: string, value: string) => {
    const updated = [...prescription];
    (updated[idx] as any)[field] = value;
    setPrescription(updated);
  };

  const addPrescriptionRow = () => {
    setPrescription([...prescription, { name: '', dosage: '', days: '', note: '' }]);
  };

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Quản lý lịch hẹn</h1>

      <div className={styles.filterBar}>
        {(Object.keys(statusLabels) as StatusFilter[]).map(s => (
          <button key={s}
            className={`${styles.filterBtn} ${filter === s ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(s)}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr><th>Bệnh nhân</th><th>STT</th><th>Loại</th><th>Ngày</th><th>Giờ</th><th>Dịch vụ</th><th>Lý do</th><th>Trạng thái</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>{a.patientCode ? <code style={{ fontSize: 11 }}>{a.patientCode}</code> : `BN #${a.patientId}`}</td>
                <td><strong style={{ color: 'var(--color-primary)' }}>{a.queueNumber ?? '—'}</strong></td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: a.appointmentType === 'REVISIT' ? '#fef3c7' : '#dbeafe', color: a.appointmentType === 'REVISIT' ? '#92400e' : '#1e40af' }}>
                    {a.appointmentType === 'REVISIT' ? 'Tái khám' : 'Lần đầu'}
                  </span>
                </td>
                <td>{a.appointmentDate}</td>
                <td>{a.startTime} - {a.endTime}</td>
                <td>{a.serviceName}</td>
                <td>{a.reason}</td>
                <td><span className={statusBadgeClass[a.status]}>{statusLabels[a.status]}</span></td>
                <td>
                  {a.status === 'PENDING' && (
                    <>
                      <button className={`${styles.btnAction} ${styles.btnApprove}`} onClick={() => approveAppt(a)}><FiCheck /> Duyệt</button>
                      <button className={`${styles.btnAction} ${styles.btnReject}`} onClick={() => openReject(a)}><FiX /> Từ chối</button>
                    </>
                  )}
                  {a.status === 'CONFIRMED' && (
                    <button className={`${styles.btnAction} ${styles.btnComplete}`} onClick={() => openDetail(a)}><FiCheckCircle /> Khám xong</button>
                  )}
                  <button className={`${styles.btnAction} ${styles.btnView}`} onClick={() => openDetail(a)}><FiEye /> Xem</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Không có lịch hẹn nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Từ chối lịch hẹn</div>
            <div className={styles.modalField}>
              <label>Lý do từ chối</label>
              <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do..." />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowRejectModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={confirmReject}>Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Complete Modal */}
      {showDetailModal && selectedAppt && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Chi tiết lịch hẹn #{selectedAppt.id}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div><strong>Bệnh nhân:</strong> {selectedAppt.patientCode || `#${selectedAppt.patientId}`}</div>
              <div><strong>STT:</strong> #{selectedAppt.queueNumber ?? '—'}</div>
              <div><strong>Loại khám:</strong> {selectedAppt.appointmentType === 'REVISIT' ? 'Tái khám' : 'Khám lần đầu'}</div>
              <div><strong>Ngày:</strong> {selectedAppt.appointmentDate}</div>
              <div><strong>Giờ:</strong> {selectedAppt.startTime} - {selectedAppt.endTime}</div>
              <div><strong>Dịch vụ:</strong> {selectedAppt.serviceName}</div>
              <div style={{ gridColumn: '1/-1' }}><strong>Lý do:</strong> {selectedAppt.reason}</div>
            </div>

            {selectedAppt.status === 'CONFIRMED' && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '1rem 0' }} />
                <div className={styles.modalTitle}>Ghi kết quả khám</div>

                <div className={styles.modalField}>
                  <label>Chẩn đoán</label>
                  <textarea rows={2} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Nhập chẩn đoán..." />
                </div>
                <div className={styles.modalField}>
                  <label>Mã ICD-10 (theo Luật Khám chữa bệnh)</label>
                  <input value={icdCode} onChange={e => setIcdCode(e.target.value.toUpperCase())} placeholder="VD: J06.9, K21.0, L70.0" maxLength={10} />
                </div>
                <div className={styles.modalField}>
                  <label>Kết luận</label>
                  <textarea rows={2} value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="Kết luận khám..." />
                </div>

                <div className={styles.modalTitle}>Kê đơn thuốc</div>
                {prescription.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input placeholder="Tên thuốc" value={p.name} onChange={e => updatePrescription(idx, 'name', e.target.value)} />
                    <input placeholder="Liều lượng" value={p.dosage} onChange={e => updatePrescription(idx, 'dosage', e.target.value)} />
                    <input placeholder="Số ngày" value={p.days} onChange={e => updatePrescription(idx, 'days', e.target.value)} />
                    <input placeholder="Ghi chú" value={p.note} onChange={e => updatePrescription(idx, 'note', e.target.value)} />
                  </div>
                ))}
                <button className={styles.btnSecondary} onClick={addPrescriptionRow} style={{ marginBottom: '1rem' }}>+ Thêm thuốc</button>

                <div className={styles.modalField}>
                  <label>Upload file kết quả (PDF, ảnh)</label>
                  <input type="file" accept=".pdf,.jpg,.png" multiple />
                </div>
              </>
            )}

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowDetailModal(false)}>Đóng</button>
              {selectedAppt.status === 'CONFIRMED' && (
                <button className={styles.btnPrimary} onClick={completeAppt}>Hoàn thành khám</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointments;
