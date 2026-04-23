import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiUser, FiBarChart2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import type { SidebarSection } from '../../components/layout/DashboardLayout';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAppointments } from '../../services/healthApi';
import styles from '../patient/PatientDashboard.module.css';

const doctorSidebar: SidebarSection[] = [
  { label: 'Tổng quan', items: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: FiCalendar },
    { path: '/doctor/schedule', label: 'Lịch làm việc', icon: FiClock },
  ]},
  { label: 'Quản lý', items: [
    { path: '/doctor/appointments', label: 'Lịch hẹn', icon: FiCheckCircle },
    { path: '/doctor/patients', label: 'Bệnh nhân', icon: FiUsers },
  ]},
  { label: 'Cá nhân', items: [
    { path: '/doctor/profile', label: 'Hồ sơ', icon: FiUser },
    { path: '/doctor/stats', label: 'Thống kê', icon: FiBarChart2 },
  ]},
];

const DoctorDashboard = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getDoctorAppointments(profile.id).catch(() => []);
      setAppointments(data);
    };

    load();
  }, [profile?.id]);

  const today = appointments.filter(a => a.status === 'CONFIRMED');
  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Dashboard Bác sĩ</h1>
      <div className={styles.cards}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}><FiCalendar /></div>
          <div><div className={styles.statNum}>{today.length}</div><div className={styles.statLabel}>Lịch hôm nay</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}><FiCheckCircle /></div>
          <div><div className={styles.statNum}>{appointments.length}</div><div className={styles.statLabel}>Tổng lịch tháng</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}><FiUsers /></div>
          <div><div className={styles.statNum}>89%</div><div className={styles.statLabel}>Tỷ lệ hoàn thành</div></div>
        </div>
      </div>
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Bệnh nhân hôm nay</h2>
        <table className={styles.table}>
          <thead><tr><th>Bệnh nhân</th><th>Giờ</th><th>Lý do</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>Bệnh nhân #{a.patientId}</td>
                <td>{a.startTime}</td>
                <td>{a.reason}</td>
                <td><span className={`status-badge status-badge--${a.status.toLowerCase()}`}>{a.status}</span></td>
                <td><button className={`${styles.btnAction} ${styles.btnView}`}>Xem</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export { doctorSidebar };
export default DoctorDashboard;
