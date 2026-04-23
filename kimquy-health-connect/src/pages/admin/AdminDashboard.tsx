import { useEffect, useMemo, useState } from 'react';
import { FiUsers, FiUserPlus, FiCalendar, FiDollarSign, FiTrendingUp, FiStar } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { type Appointment } from '../../data/mockData';
import { getAdminAppointmentsAggregate, getAdminDoctors, getAdminReviewsAggregate, type AdminDoctorRow } from '../../services/healthApi';
import { adminSidebar } from './adminSidebar';
import styles from './Admin.module.css';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctorRow[]>([]);
  const [avgRating, setAvgRating] = useState('0');

  useEffect(() => {
    getAdminAppointmentsAggregate().then(setAppointments).catch(() => setAppointments([]));
    getAdminDoctors().then(setDoctors).catch(() => setDoctors([]));
    getAdminReviewsAggregate()
      .then((reviews) => {
        const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';
        setAvgRating(avg);
      })
      .catch(() => setAvgRating('0'));
  }, []);

  const revenue = appointments.filter(a => a.status === 'COMPLETED').length * 450000;
  const monthlyData = useMemo(() => {
    const map = new Map<number, number>();
    appointments.forEach((a) => {
      const month = Number(a.appointmentDate.split('-')[1]);
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from({ length: 12 }, (_, i) => map.get(i + 1) || 0);
  }, [appointments]);
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const maxVal = Math.max(...monthlyData, 1);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Dashboard Admin</h1>
      <p className={styles.pageSubtitle}>Tổng quan hoạt động phòng khám Kim Quy</p>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blue}`}><FiUsers /></div>
          <div>
            <div className={styles.kpiValue}>1,245</div>
            <div className={styles.kpiLabel}>Tổng bệnh nhân</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 12% so với tháng trước</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.green}`}><FiUserPlus /></div>
          <div>
            <div className={styles.kpiValue}>{doctors.length}</div>
            <div className={styles.kpiLabel}>Bác sĩ</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 2 bác sĩ mới</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.orange}`}><FiCalendar /></div>
          <div>
            <div className={styles.kpiValue}>{appointments.length}</div>
            <div className={styles.kpiLabel}>Lịch hẹn</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 8%</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.purple}`}><FiDollarSign /></div>
          <div>
            <div className={styles.kpiValue}>{(revenue / 1000000).toFixed(1)}M</div>
            <div className={styles.kpiLabel}>Doanh thu (VNĐ)</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 15%</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.cyan}`}><FiTrendingUp /></div>
          <div>
            <div className={styles.kpiValue}>87%</div>
            <div className={styles.kpiLabel}>Tỉ lệ hoàn thành</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.red}`}><FiStar /></div>
          <div>
            <div className={styles.kpiValue}>{avgRating}/5</div>
            <div className={styles.kpiLabel}>Đánh giá trung bình</div>
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Lịch hẹn theo tháng (2026)</h2>
          <div className={styles.chartBars}>
            {monthlyData.map((v, i) => (
              <div key={i} className={styles.chartBar}>
                <div className={styles.chartBarValue}>{v}</div>
                <div className={styles.chartBarFill} style={{ height: `${(v / maxVal) * 160}px` }} />
                <div className={styles.chartBarLabel}>{months[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Top bác sĩ</h2>
          {doctors.slice(0, 5).map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <img src={d.avatarUrl} alt={d.fullName} className={styles.avatar} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{d.specialtyName}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>★ {d.averageRating.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className={styles.panelTitle} style={{ margin: 0 }}>Lịch hẹn mới nhất</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>BN #{a.patientId}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.appointmentDate} {a.startTime}</td>
                  <td><span className={`${styles.statusBadge} ${styles['status' + a.status.charAt(0) + a.status.slice(1).toLowerCase()]}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
