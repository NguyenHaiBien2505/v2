import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAppointments } from '../../services/healthApi';
import styles from './DoctorStats.module.css';

const DoctorStats = () => {
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

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const monthlyData = useMemo(() => {
    const map = new Map<number, number>();
    appointments.forEach((a) => {
      const month = Number(a.appointmentDate.split('-')[1]);
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}`, count: map.get(i + 1) || 0 }));
  }, [appointments]);
  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1);
  const topSpecialties = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => map.set(a.specialtyName, (map.get(a.specialtyName) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Thống kê</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{total}</div>
          <div className={styles.statLabel}>Tổng lịch hẹn</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: '#2E7D32' }}>{completed}</div>
          <div className={styles.statLabel}>Đã hoàn thành</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: '#1976D2' }}>{confirmed}</div>
          <div className={styles.statLabel}>Đã xác nhận</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: '#E53935' }}>{cancelled}</div>
          <div className={styles.statLabel}>Đã hủy</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Monthly bar chart */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Số lịch khám theo tháng (2026)</div>
          <div className={styles.barChart}>
            {monthlyData.map(d => (
              <div key={d.month} className={styles.barCol}>
                <div className={styles.barValue}>{d.count}</div>
                <div className={styles.bar} style={{
                  height: `${(d.count / maxCount) * 160}px`,
                  background: `linear-gradient(180deg, var(--color-primary-light), var(--color-primary))`,
                }} />
                <div className={styles.barLabel}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top specialties + completion */}
        <div>
          <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
            <div className={styles.cardTitle}>Tỷ lệ hoàn thành</div>
            <div className={styles.donutWrap}>
              <div className={styles.donut} style={{
                background: `conic-gradient(var(--color-secondary) ${completionRate * 3.6}deg, var(--color-border-light) 0deg)`
              }}>
                <div className={styles.donutCenter}>{completionRate}%</div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Top chuyên khoa được đặt</div>
            <ul className={styles.rankList}>
              {topSpecialties.map((s, i) => (
                <li key={s.name} className={styles.rankItem}>
                  <span className={styles.rankNum}>{i + 1}</span>
                  <span className={styles.rankName}>{s.name}</span>
                  <span className={styles.rankCount}>{s.count} lượt</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorStats;
