import { useEffect, useState } from 'react';
import { FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import type { Appointment } from '../../data/mockData';
import { getAdminAppointmentsAggregate, updateAppointmentStatus } from '../../services/healthApi';
import { sendNotification } from '../../services/notificationService';
import styles from './Admin.module.css';

const STATUSES: Array<Appointment['status'] | 'ALL'> = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const AdminAppointments = () => {
  const [list, setList] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<typeof STATUSES[number]>('ALL');
  const [view, setView] = useState<Appointment | null>(null);

  useEffect(() => {
    getAdminAppointmentsAggregate().then(setList).catch(() => setList([]));
  }, []);

  const filtered = list.filter(a =>
    (filter === 'ALL' || a.status === filter) &&
    (a.doctorName.toLowerCase().includes(search.toLowerCase()) || String(a.id).includes(search))
  );

  const setStatus = (appt: Appointment, status: Appointment['status']) => {
    updateAppointmentStatus(appt.id, status).catch(() => null);
    setList(list.map(a => a.id === appt.id ? { ...a, status } : a));
    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      sendNotification({
        event: status === 'CONFIRMED' ? 'APPOINTMENT_CONFIRMED' : 'APPOINTMENT_CANCELLED',
        channels: ['EMAIL', 'SMS'],
        email: `patient${appt.patientId}@kimquy.vn`,
        phone: `+8490000${String(appt.patientId).padStart(4, '0')}`,
        context: { patientName: `BN #${appt.patientId}`, doctorName: appt.doctorName, date: appt.appointmentDate, time: `${appt.startTime}-${appt.endTime}`, reason: 'Quản trị viên xử lý' },
      });
    }
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý lịch hẹn</h1>
      <p className={styles.pageSubtitle}>Theo dõi và xử lý {list.length} lịch hẹn</p>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo bác sĩ, mã lịch hẹn..." />
        </div>
        <div className={styles.filters}>
          {STATUSES.map(s => (
            <button key={s} className={`${styles.filterChip} ${filter === s ? styles.active : ''}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'Tất cả' : s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Mã</th><th>BN</th><th>STT</th><th>Bác sĩ</th><th>Loại</th><th>Dịch vụ</th><th>Ngày giờ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>{a.patientCode ? <code style={{ fontSize: 11 }}>{a.patientCode}</code> : `BN #${a.patientId}`}</td>
                  <td><strong style={{ color: 'var(--color-primary)' }}>{a.queueNumber ?? '—'}</strong></td>
                  <td>{a.doctorName}</td>
                  <td><span className={styles.statusBadge} style={{ background: a.appointmentType === 'REVISIT' ? '#f59e0b20' : '#3b82f620', color: a.appointmentType === 'REVISIT' ? '#f59e0b' : '#3b82f6' }}>{a.appointmentType === 'REVISIT' ? 'Tái khám' : 'Lần đầu'}</span></td>
                  <td>{a.serviceName}</td>
                  <td>{a.appointmentDate}<br /><small>{a.startTime} - {a.endTime}</small></td>
                  <td><span className={`${styles.statusBadge} ${styles['status' + a.status.charAt(0) + a.status.slice(1).toLowerCase()]}`}>{a.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => setView(a)}><FiEye /></button>
                      {a.status === 'PENDING' && (
                        <>
                          <button className={styles.btnIcon} onClick={() => setStatus(a, 'CONFIRMED')} title="Xác nhận"><FiCheck /></button>
                          <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => setStatus(a, 'CANCELLED')} title="Từ chối"><FiX /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {view && (
        <div className={styles.modalOverlay} onClick={() => setView(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết lịch hẹn #{view.id}</h2>
              <button className={styles.modalClose} onClick={() => setView(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Bệnh nhân:</strong> {view.patientCode ? `${view.patientCode} (BN #${view.patientId})` : `BN #${view.patientId}`}</p>
              <p><strong>STT trong ngày:</strong> {view.queueNumber ?? '—'}</p>
              <p><strong>Loại khám:</strong> {view.appointmentType === 'REVISIT' ? 'Tái khám' : 'Khám lần đầu'}</p>
              <p><strong>Bác sĩ:</strong> {view.doctorName}</p>
              <p><strong>Chuyên khoa:</strong> {view.specialtyName}</p>
              <p><strong>Dịch vụ:</strong> {view.serviceName}</p>
              <p><strong>Thời gian:</strong> {view.appointmentDate} {view.startTime} - {view.endTime}</p>
              <p><strong>Lý do khám:</strong> {view.reason}</p>
              {view.notes && <p><strong>Ghi chú:</strong> {view.notes}</p>}
              <p><strong>Trạng thái:</strong> <span className={`${styles.statusBadge} ${styles['status' + view.status.charAt(0) + view.status.slice(1).toLowerCase()]}`}>{view.status}</span></p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setView(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAppointments;
