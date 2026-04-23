import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiBell, FiStar, FiUser, FiFileText, FiActivity } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { SidebarSection } from '../../components/layout/DashboardLayout';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { countUnreadNotifications, getPatientAppointments } from '../../services/healthApi';
import styles from './PatientDashboard.module.css';

const patientSidebar: SidebarSection[] = [
  {
    label: 'Tổng quan',
    items: [
      { path: '/patient/dashboard', label: 'Dashboard', icon: FiCalendar },
      { path: '/patient/booking', label: 'Đặt lịch khám', icon: FiClock },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { path: '/patient/appointments', label: 'Lịch hẹn', icon: FiCheckCircle },
      { path: '/patient/medical-records', label: 'Hồ sơ khám', icon: FiFileText },
      { path: '/patient/treatment', label: 'Tiến trình điều trị', icon: FiActivity },
      { path: '/patient/reviews', label: 'Đánh giá', icon: FiStar },
      { path: '/patient/notifications', label: 'Thông báo', icon: FiBell, badge: 2 },
    ],
  },
  {
    label: 'Cá nhân',
    items: [
      { path: '/patient/profile', label: 'Hồ sơ sức khỏe', icon: FiUser },
    ],
  },
];

const PatientDashboard = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const [appts, unread] = await Promise.all([
        getPatientAppointments(profile.id).catch(() => []),
        countUnreadNotifications(profile.id).catch(() => 0),
      ]);
      setAppointments(appts);
      setUnreadCount(unread);
    };

    load();
  }, [profile?.id]);

  const upcoming = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={styles.pageTitle}>Dashboard bệnh nhân</h1>

      {/* Stats */}
      <div className={styles.cards}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}><FiCalendar /></div>
          <div><div className={styles.statNum}>{upcoming.length}</div><div className={styles.statLabel}>Lịch sắp tới</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}><FiCheckCircle /></div>
          <div><div className={styles.statNum}>{completed.length}</div><div className={styles.statLabel}>Đã khám xong</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}><FiAlertCircle /></div>
          <div><div className={styles.statNum}>{unreadCount}</div><div className={styles.statLabel}>Thông báo mới</div></div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Lịch hẹn sắp tới</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Bác sĩ</th>
              <th>Chuyên khoa</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className={styles.docCell}>
                    <img src={a.doctorAvatar} alt="" />
                    {a.doctorName}
                  </div>
                </td>
                <td>{a.specialtyName}</td>
                <td>{a.appointmentDate}</td>
                <td>{a.startTime}</td>
                <td>
                  <span className={`status-badge status-badge--${a.status.toLowerCase()}`}>{a.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt'}</span>
                </td>
                <td>
                  <Link to={`/patient/appointments/${a.id}`}>
                    <button className={`${styles.btnAction} ${styles.btnView}`}>Chi tiết</button>
                  </Link>
                </td>
              </tr>
            ))}
            {upcoming.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Không có lịch hẹn sắp tới</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export { patientSidebar };
export default PatientDashboard;
