import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getPatientAppointments } from '../../services/healthApi';
import styles from './PatientDashboard.module.css';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
const filterLabels: Record<Filter, string> = { ALL: 'Tất cả', PENDING: 'Chờ duyệt', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Đã khám', CANCELLED: 'Đã hủy' };

const PatientAppointments = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getPatientAppointments(profile.id).catch(() => []);
      setAppointments(data);
    };

    load();
  }, [profile?.id]);

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={styles.pageTitle}>Lịch hẹn của tôi</h1>
      <div className={styles.filterBar}>
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`} onClick={() => setFilter(f)}>
            {filterLabels[f]}
          </button>
        ))}
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr><th>Bác sĩ</th><th>Chuyên khoa</th><th>Loại</th><th>Ngày</th><th>STT</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td><div className={styles.docCell}><img src={a.doctorAvatar} alt="" />{a.doctorName}</div></td>
                <td>{a.specialtyName}</td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: a.appointmentType === 'REVISIT' ? '#fef3c7' : '#dbeafe', color: a.appointmentType === 'REVISIT' ? '#92400e' : '#1e40af' }}>
                    {a.appointmentType === 'REVISIT' ? 'Tái khám' : 'Lần đầu'}
                  </span>
                </td>
                <td>{a.appointmentDate}<br /><small>{a.startTime}</small></td>
                <td><strong style={{ color: 'var(--color-primary)' }}>{a.queueNumber ?? '—'}</strong></td>
                <td><span className={`status-badge status-badge--${a.status.toLowerCase()}`}>{filterLabels[a.status as Filter] || a.status}</span></td>
                <td>
                  <Link to={`/patient/appointments/${a.id}`}><button className={`${styles.btnAction} ${styles.btnView}`}>Chi tiết</button></Link>
                  {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                    <Link to={`/patient/appointments/${a.id}`}><button className={`${styles.btnAction} ${styles.btnCancel}`} style={{ marginLeft: 6 }}>Hủy</button></Link>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="empty-state">Không có lịch hẹn</td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
