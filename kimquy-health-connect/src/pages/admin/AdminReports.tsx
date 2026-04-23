import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { type Appointment } from '../../data/mockData';
import { getAdminAppointmentsAggregate, getAdminDoctors, getAllSpecialties, type AdminDoctorRow } from '../../services/healthApi';
import styles from './Admin.module.css';

const AdminReports = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    getAdminAppointmentsAggregate().then(setAppointments).catch(() => setAppointments([]));
    getAdminDoctors().then(setDoctors).catch(() => setDoctors([]));
    getAllSpecialties()
      .then((items) => setSpecialties(items.map((s) => ({ id: s.id, name: s.name }))))
      .catch(() => setSpecialties([]));
  }, []);

  const revenueData = useMemo(() => {
    const map = new Map<number, number>();
    appointments.forEach((a) => {
      const month = Number(a.appointmentDate.split('-')[1]);
      map.set(month, (map.get(month) || 0) + 1);
    });
    return Array.from({ length: 12 }, (_, i) => map.get(i + 1) || 0);
  }, [appointments]);
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const maxRev = Math.max(...revenueData);

  const specialtyStats = specialties.slice(0, 6).map((s, i) => ({
    name: s.name,
    count: [120, 95, 88, 72, 65, 50][i] || 30,
  }));
  const maxSp = Math.max(...specialtyStats.map(s => s.count));

  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const totalAppointments = specialtyStats.reduce((a, b) => a + b.count, 0);

  const exportCSV = () => {
    const csv = 'Tháng,Số lịch hẹn\n' + months.map((m, i) => `${m},${revenueData[i]}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-${period}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Báo cáo & Thống kê</h1>
      <p className={styles.pageSubtitle}>Phân tích hoạt động phòng khám</p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['week', 'month', 'quarter', 'year'] as const).map(p => (
            <button key={p} className={`${styles.filterChip} ${period === p ? styles.active : ''}`} onClick={() => setPeriod(p)}>
              {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
            </button>
          ))}
        </div>
        <button className={styles.btnPrimary} onClick={exportCSV}><FiDownload /> Xuất CSV</button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.green}`}><FiDollarSign /></div>
          <div>
            <div className={styles.kpiValue}>{(totalRevenue * 0.45).toFixed(0)}M</div>
            <div className={styles.kpiLabel}>Doanh thu (triệu VNĐ)</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 18.5%</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blue}`}><FiCalendar /></div>
          <div>
            <div className={styles.kpiValue}>{totalAppointments}</div>
            <div className={styles.kpiLabel}>Lịch hẹn (tháng)</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 12%</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.orange}`}><FiUsers /></div>
          <div>
            <div className={styles.kpiValue}>342</div>
            <div className={styles.kpiLabel}>Bệnh nhân mới</div>
            <div className={`${styles.kpiDelta} ${styles.up}`}>↑ 8%</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.purple}`}><FiTrendingUp /></div>
          <div>
            <div className={styles.kpiValue}>92%</div>
            <div className={styles.kpiLabel}>Tỉ lệ hài lòng</div>
          </div>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Doanh thu theo tháng (triệu VNĐ)</h2>
          <div className={styles.chartBars}>
            {revenueData.map((v, i) => (
              <div key={i} className={styles.chartBar}>
                <div className={styles.chartBarValue}>{(v * 0.45).toFixed(0)}</div>
                <div className={styles.chartBarFill} style={{ height: `${(v / maxRev) * 160}px` }} />
                <div className={styles.chartBarLabel}>{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Phân bổ theo chuyên khoa</h2>
          {specialtyStats.map(s => (
            <div key={s.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{s.name}</span>
                <strong>{s.count}</strong>
              </div>
              <div style={{ background: 'var(--color-bg)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(s.count / maxSp) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className={styles.panelTitle} style={{ margin: 0 }}>Bảng xếp hạng bác sĩ</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Hạng</th><th>Bác sĩ</th><th>Chuyên khoa</th><th>Số lịch khám</th><th>Đánh giá TB</th><th>Doanh thu (M)</th></tr></thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={d.id}>
                  <td><strong>#{i + 1}</strong></td>
                  <td>
                    <div className={styles.avatarCell}>
                      <img src={d.avatarUrl} alt={d.fullName} className={styles.avatar} />
                      <span>{d.fullName}</span>
                    </div>
                  </td>
                  <td>{d.specialtyName}</td>
                  <td>{120 - i * 15}</td>
                  <td>★ {d.averageRating.toFixed(1)}</td>
                  <td>{((120 - i * 15) * d.clinicFee / 1000000).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
