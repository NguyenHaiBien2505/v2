import { useEffect, useMemo, useState } from 'react';
import {
  FiUsers, FiUserPlus, FiCalendar, FiDollarSign,
  FiTrendingUp, FiStar, FiDownload, FiFileText,
  FiCheck, FiX,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { type Appointment } from '../../data/mockData';
import {
  getAdminAppointmentsAggregate, getAdminDoctors,
  getAdminReviewsAggregate, type AdminDoctorRow, getTotalRevenue,
  updateAppointmentStatus,
} from '../../services/healthApi';
import { sendNotification } from '../../services/notificationService';
import { adminSidebar } from './adminSidebar';
import styles from './Admin.module.css';

type Period = 'week' | 'month' | 'year';

/* ─── helpers ─────────────────────────────────────────── */
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

/* ─── export helpers ─────────────────────────────────── */
function exportCSV(rows: { label: string; value: number }[], filename: string) {
  const header = 'Thời gian,Số lịch hẹn\n';
  const body = rows.map(r => `${r.label},${r.value}`).join('\n');
  const blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(rows: { label: string; value: number }[], filename: string) {
  const table = `<table><thead><tr><th>Thời gian</th><th>Số lịch hẹn</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join('')}</tbody></table>`;
  const blob = new Blob(['\uFEFF' + table], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename + '.xls'; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(
  rows: { label: string; value: number }[],
  title: string,
  filename: string,
) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Xuat ngay: ${new Date().toLocaleDateString('vi-VN')}`, 14, 26);

  // Draw table header
  const colWidths = [90, 80];
  let y = 36;
  doc.setFillColor(59, 130, 246);
  doc.rect(14, y, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Thoi gian', 17, y + 7);
  doc.text('So lich hen', 17 + colWidths[0], y + 7);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(243, 244, 246);
      doc.rect(14, y, 180, 9, 'F');
    }
    doc.text(r.label, 17, y + 6.5);
    doc.text(r.value.toString(), 17 + colWidths[0], y + 6.5);
    y += 9;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save(filename + '.pdf');
}

/* ─── component ──────────────────────────────────────── */
const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctorRow[]>([]);
  const [avgRating, setAvgRating] = useState('0');
  const [realRevenue, setRealRevenue] = useState(0);
  const [period, setPeriod] = useState<Period>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getAdminAppointmentsAggregate().then(setAppointments).catch(() => setAppointments([]));
    getAdminDoctors().then(setDoctors).catch(() => setDoctors([]));
    getAdminReviewsAggregate()
      .then((reviews) => {
        const avg = reviews.length
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          : '0';
        setAvgRating(avg);
      })
      .catch(() => setAvgRating('0'));
    getTotalRevenue().then(setRealRevenue).catch(() => setRealRevenue(0));
  }, []);

  const setStatus = (appt: Appointment, status: Appointment['status']) => {
    updateAppointmentStatus(appt.id, status).catch(() => null);
    setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status } : a));
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

  // Mock calculations removed; using realRevenue for KPI.

  /* ── chart data ─── */
  const chartData = useMemo(() => {
    const filtered = appointments.filter(a => {
      const y = Number(a.appointmentDate.split('-')[0]);
      return y === selectedYear;
    });

    if (period === 'week') {
      const map = new Map<number, number>();
      filtered.forEach(a => {
        const w = getISOWeek(new Date(a.appointmentDate));
        map.set(w, (map.get(w) || 0) + 1);
      });
      const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
      return weeks
        .filter(w => (map.get(w) || 0) > 0)
        .map(w => ({ label: `Tuần ${w}`, value: map.get(w) || 0 }));
    }

    if (period === 'month') {
      const map = new Map<number, number>();
      filtered.forEach(a => {
        const m = Number(a.appointmentDate.split('-')[1]);
        map.set(m, (map.get(m) || 0) + 1);
      });
      return Array.from({ length: 12 }, (_, i) => ({
        label: `T${i + 1}`,
        value: map.get(i + 1) || 0,
      }));
    }

    // year
    const map = new Map<number, number>();
    appointments.forEach(a => {
      const y = Number(a.appointmentDate.split('-')[0]);
      map.set(y, (map.get(y) || 0) + 1);
    });
    const years = Array.from(new Set([...map.keys(), selectedYear])).sort();
    return years.map(y => ({ label: `${y}`, value: map.get(y) || 0 }));
  }, [appointments, period, selectedYear]);

  const totalInPeriod = chartData.reduce((s, r) => s + r.value, 0);

  const periodLabel = period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm';
  const fileBase = `lich-hen-theo-${periodLabel}-${selectedYear}-${Date.now()}`;

  const availableYears = useMemo(() => {
    const ySet = new Set(appointments.map(a => Number(a.appointmentDate.split('-')[0])));
    ySet.add(new Date().getFullYear());
    return Array.from(ySet).sort((a, b) => b - a);
  }, [appointments]);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Dashboard Admin</h1>
      <p className={styles.pageSubtitle}>Tổng quan hoạt động phòng khám Kim Quy</p>

      {/* KPI */}
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
            <div className={styles.kpiValue}>{(realRevenue / 1000000).toFixed(1)}M</div>
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

      {/* Appointment statistics panel */}
      <div className={styles.panelCard} style={{ marginBottom: 16 }}>
        {/* toolbar */}
        <div className={styles.statsPanelHeader}>
          <div>
            <h2 className={styles.panelTitle} style={{ margin: 0 }}>
              Thống kê lịch hẹn theo {periodLabel}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0' }}>
              Tổng: <strong>{totalInPeriod}</strong> lịch hẹn
            </p>
          </div>
          <div className={styles.statsPanelActions}>
            {/* Period selector */}
            <div className={styles.filters}>
              {(['week', 'month', 'year'] as Period[]).map(p => (
                <button
                  key={p}
                  className={`${styles.filterChip} ${period === p ? styles.active : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
            {/* Year selector */}
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className={styles.yearSelect}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {/* Export buttons */}
            <div className={styles.exportGroup}>
              <button className={styles.btnExport} onClick={() => exportCSV(chartData, fileBase)}>
                <FiDownload /> CSV
              </button>
              <button className={styles.btnExport} onClick={() => exportExcel(chartData, fileBase)}>
                <FiFileText /> Excel
              </button>
              <button className={`${styles.btnExport} ${styles.btnExportPdf}`}
                onClick={() => exportPDF(chartData, `Thống kê lịch hẹn theo ${periodLabel} - ${selectedYear}`, fileBase)}>
                <FiFileText /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* chart */}
        <div style={{ height: 280, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(val: number) => [val, 'Lịch hẹn']}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Legend />
              <Bar dataKey="value" name="Lịch hẹn" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column: top doctors */}
      <div className={styles.twoCol}>
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
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Tóm tắt</h2>
          <div className={styles.summaryItem}>
            <span>Đã hoàn thành</span>
            <strong>{appointments.filter(a => a.status === 'COMPLETED').length}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đang chờ</span>
            <strong>{appointments.filter(a => a.status === 'PENDING').length}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đã xác nhận</span>
            <strong>{appointments.filter(a => a.status === 'CONFIRMED').length}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Đã hủy</span>
            <strong>{appointments.filter(a => a.status === 'CANCELLED').length}</strong>
          </div>
          <div className={styles.summaryItem} style={{ borderBottom: 'none', marginTop: 8, fontWeight: 700 }}>
            <span>Tổng doanh thu</span>
            <strong>{formatCurrency(realRevenue)} ₫</strong>
          </div>
        </div>
      </div>

      {/* Latest appointments */}
      <div className={styles.tableCard}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className={styles.panelTitle} style={{ margin: 0 }}>Lịch hẹn mới nhất</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Bác sĩ</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 10).map(a => (
                <tr key={a.id}>
                  <td>{a.patientCode || `BN #${a.patientId}`}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.appointmentDate} {a.startTime}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles['status' + a.status.charAt(0) + a.status.slice(1).toLowerCase()]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === 'PENDING' && (
                      <div className={styles.actions}>
                        <button className={styles.btnIcon} onClick={() => setStatus(a, 'CONFIRMED')} title="Xác nhận"><FiCheck /></button>
                        <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => setStatus(a, 'CANCELLED')} title="Từ chối"><FiX /></button>
                      </div>
                    )}
                  </td>
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
