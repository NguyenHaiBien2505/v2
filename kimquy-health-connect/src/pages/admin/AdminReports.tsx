import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiDownload, FiTrendingUp, FiUsers, FiDollarSign,
  FiCalendar, FiFileText, FiRefreshCw,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import {
  getAdminDoctors, getAllSpecialties, type AdminDoctorRow,
  getRevenueMonthly, getRevenueWeekly, getRevenueYearly, getRevenueDaily,
  type RevenueReport,
} from '../../services/healthApi';
import styles from './Admin.module.css';

type Period = 'day' | 'week' | 'month' | 'year';

/* ─── helpers ────────────────────────────────────────────── */
function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function periodLabel(p: Period) {
  return p === 'day' ? 'ngày' : p === 'week' ? 'tuần' : p === 'month' ? 'tháng' : 'năm';
}

/* ─── chart data mapper ──────────────────────────────────── */
function toChartRows(report: RevenueReport, period: Period) {
  return report.data.map(d => ({
    label: period === 'day'
      ? `Ngày ${d.period}`
      : period === 'week'
      ? `Tuần ${d.period}`
      : period === 'month'
        ? `T${d.period}`
        : `${d.period}`,
    revenue: d.revenue,
    appointments: d.count,
  }));
}

/* ─── export helpers ─────────────────────────────────────── */
function exportCSV(
  rows: { label: string; appointments: number; revenue: number }[],
  filename: string,
) {
  const header = 'Thời gian,Số giao dịch,Doanh thu (VNĐ)\n';
  const body   = rows.map(r => `${r.label},${r.appointments},${r.revenue}`).join('\n');
  const blob   = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(
  rows: { label: string; appointments: number; revenue: number }[],
  filename: string,
) {
  const html = `<table>
    <thead><tr><th>Thời gian</th><th>Số giao dịch</th><th>Doanh thu (VNĐ)</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${r.label}</td><td>${r.appointments}</td><td>${r.revenue}</td></tr>`).join('')}</tbody>
  </table>`;
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename + '.xls'; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(
  rows: { label: string; appointments: number; revenue: number }[],
  title: string,
  totalRevenue: number,
  totalTx: number,
  filename: string,
) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');   doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`Xuat ngay: ${new Date().toLocaleDateString('vi-VN')}`, 14, 26);
  doc.text(`Tong giao dich: ${totalTx}   |   Tong doanh thu: ${formatCurrency(totalRevenue)} VND`, 14, 33);

  const cols = [70, 50, 60];
  let y = 42;

  doc.setFillColor(16, 185, 129);
  doc.rect(14, y, 180, 10, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
  doc.text('Thoi gian', 17, y + 7);
  doc.text('So giao dich', 17 + cols[0], y + 7);
  doc.text('Doanh thu (VND)', 17 + cols[0] + cols[1], y + 7);
  y += 10;

  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
  rows.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(243, 244, 246); doc.rect(14, y, 180, 9, 'F'); }
    doc.text(r.label, 17, y + 6.5);
    doc.text(r.appointments.toString(), 17 + cols[0], y + 6.5);
    doc.text(formatCurrency(r.revenue), 17 + cols[0] + cols[1], y + 6.5);
    y += 9;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.save(filename + '.pdf');
}

/* ─── component ─────────────────────────────────────────── */
const AdminReports = () => {
  const [period, setPeriod]           = useState<Period>('day');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [report, setReport]           = useState<RevenueReport | null>(null);
  const [loading, setLoading]         = useState(false);
  const [doctors, setDoctors]         = useState<AdminDoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<Array<{ id: number; name: string }>>([]);

  // ── fetch revenue ──────────────────────────────────────────
  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      let r: RevenueReport;
      if (period === 'day')        r = await getRevenueDaily(selectedYear, selectedMonth);
      else if (period === 'week')  r = await getRevenueWeekly(selectedYear, selectedMonth);
      else if (period === 'month') r = await getRevenueMonthly(selectedYear);
      else                         r = await getRevenueYearly();
      setReport(r);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [period, selectedYear, selectedMonth]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  useEffect(() => {
    getAdminDoctors().then(setDoctors).catch(() => setDoctors([]));
    getAllSpecialties()
      .then(items => setSpecialties(items.map(s => ({ id: s.id, name: s.name }))))
      .catch(() => setSpecialties([]));
  }, []);

  // ── chart rows ─────────────────────────────────────────────
  const chartRows = useMemo(() =>
    report ? toChartRows(report, period) : [],
    [report, period]
  );

  const totalRevenue = report?.totalRevenue ?? 0;
  const totalTx      = report?.totalTransactions ?? 0;

  // ── table data ─────────────────────────────────────────────
  const tableData = useMemo(() => {
    if (!chartRows.length) return [];
    const result = [];
    for (let i = 0; i < chartRows.length; i++) {
      const cur = chartRows[i];
      const prev = i > 0 ? chartRows[i - 1] : null;

      const avg = cur.appointments > 0 ? cur.revenue / cur.appointments : 0;
      
      let growthStr = '-';
      let trend = '➡️ Ổn định';
      let growthVal = 0;

      if (prev && prev.revenue > 0) {
        growthVal = ((cur.revenue - prev.revenue) / prev.revenue) * 100;
        growthStr = (growthVal > 0 ? '+' : '') + growthVal.toFixed(1) + '%';
        if (growthVal > 0) trend = '📈 Tăng';
        else if (growthVal < 0) trend = '📉 Giảm';
      } else if (prev && prev.revenue === 0 && cur.revenue > 0) {
        growthStr = '+100%';
        trend = '📈 Tăng';
      } else if (prev && prev.revenue > 0 && cur.revenue === 0) {
        growthStr = '-100%';
        trend = '📉 Giảm';
      }

      result.push({
        label: cur.label,
        appointments: cur.appointments,
        revenue: cur.revenue,
        avg: avg,
        growth: growthStr,
        trend: trend,
        growthVal,
      });
    }
    // Reverse to show most recent periods at the top
    return result.reverse();
  }, [chartRows]);

  // ── available years (năm hiện tại + vài năm trước) ────────
  const availableYears = useMemo(() => {
    const cur = new Date().getFullYear();
    return [cur, cur - 1, cur - 2, cur - 3].filter(y => y > 2020);
  }, []);

  const pLabel  = periodLabel(period);
  const fileBase = `doanh-thu-theo-${pLabel}-${selectedYear}-${Date.now()}`;
  const pdfTitle = `Bao cao doanh thu theo ${pLabel} - ${selectedYear}`;

  // ── specialty stats (placeholder) ─────────────────────────
  const specialtyStats = specialties.slice(0, 6).map((s, i) => ({
    name: s.name,
    count: [120, 95, 88, 72, 65, 50][i] || 30,
  }));
  const maxSp = Math.max(...specialtyStats.map(s => s.count), 1);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Báo cáo &amp; Thống kê</h1>
      <p className={styles.pageSubtitle}>Doanh thu thực từ giao dịch đã thanh toán (PayOS)</p>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              className={`${styles.filterChip} ${period === p ? styles.active : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'day' ? 'Ngày' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {(period === 'week' || period === 'day') && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className={styles.yearSelect}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          )}

          {period !== 'year' && (
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className={styles.yearSelect}
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          <button className={styles.btnSecondary} onClick={fetchRevenue} disabled={loading}>
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Đang tải…' : 'Làm mới'}
          </button>

          <div className={styles.exportGroup}>
            <button className={styles.btnExport} onClick={() => exportCSV(chartRows, fileBase)}>
              <FiDownload /> CSV
            </button>
            <button className={styles.btnExport} onClick={() => exportExcel(chartRows, fileBase)}>
              <FiFileText /> Excel
            </button>
            <button
              className={`${styles.btnExport} ${styles.btnExportPdf}`}
              onClick={() => exportPDF(chartRows, pdfTitle, totalRevenue, totalTx, fileBase)}
            >
              <FiFileText /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI ── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.green}`}><FiDollarSign /></div>
          <div>
            <div className={styles.kpiValue}>
              {loading ? '…' : `${(totalRevenue / 1_000_000).toFixed(1)}M`}
            </div>
            <div className={styles.kpiLabel}>Doanh thu ({pLabel})</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>
              {formatCurrency(totalRevenue)} ₫
            </div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blue}`}><FiCalendar /></div>
          <div>
            <div className={styles.kpiValue}>{loading ? '…' : totalTx}</div>
            <div className={styles.kpiLabel}>Giao dịch thành công</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.orange}`}><FiUsers /></div>
          <div>
            <div className={styles.kpiValue}>{doctors.length}</div>
            <div className={styles.kpiLabel}>Bác sĩ đang hoạt động</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.purple}`}><FiTrendingUp /></div>
          <div>
            <div className={styles.kpiValue}>
              {totalTx > 0
                ? `${(totalRevenue / totalTx / 1000).toFixed(0)}K`
                : '—'}
            </div>
            <div className={styles.kpiLabel}>Doanh thu trung bình / GD</div>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      {report && chartRows.length > 0 ? (
        <div className={styles.twoCol}>
          {/* Revenue bar */}
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>
              Doanh thu theo {pLabel} (triệu VNĐ)
            </h2>
            <div style={{ height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val) + ' ₫', 'Doanh thu']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions line */}
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>
              Số giao dịch theo {pLabel}
            </h2>
            <div style={{ height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartRows} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val: number) => [val, 'Giao dịch']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    name="Giao dịch"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.panelCard} style={{ textAlign: 'center', padding: '48px 20px', marginBottom: 16, color: 'var(--color-text-light)' }}>
          {loading
            ? '⏳ Đang tải dữ liệu doanh thu…'
            : '📊 Chưa có dữ liệu thanh toán cho kỳ này.'}
        </div>
      )}

      {/* ── Detailed stats table ── */}
      {tableData.length > 0 && (
        <div className={styles.tableCard} style={{ marginBottom: 16 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className={styles.panelTitle} style={{ margin: 0 }}>Bảng thống kê chi tiết ({pLabel})</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Số giao dịch</th>
                  <th>Tổng doanh thu</th>
                  <th>TB / Giao dịch</th>
                  <th>Tăng trưởng</th>
                  <th>Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.label}>
                    <td style={{ fontWeight: 600 }}>{row.label}</td>
                    <td>{row.appointments}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(row.revenue)} ₫</td>
                    <td>{formatCurrency(row.avg)} ₫</td>
                    <td>
                      <span style={{ 
                        color: row.growthVal > 0 ? '#10b981' : row.growthVal < 0 ? '#ef4444' : 'inherit',
                        fontWeight: row.growth !== '-' ? 600 : 'normal'
                      }}>
                        {row.growth}
                      </span>
                    </td>
                    <td>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Specialty distribution ── */}
      {specialtyStats.length > 0 && (
        <div className={styles.panelCard} style={{ marginBottom: 16 }}>
          <h2 className={styles.panelTitle}>Phân bổ theo chuyên khoa</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {specialtyStats.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <strong>{s.count}</strong>
                </div>
                <div style={{ background: 'var(--color-bg)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(s.count / maxSp) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #10b981, #3b82f6)',
                    borderRadius: 4,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Doctor ranking ── */}
      <div className={styles.tableCard}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className={styles.panelTitle} style={{ margin: 0 }}>Bảng xếp hạng bác sĩ</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Bác sĩ</th>
                <th>Chuyên khoa</th>
                <th>Phí khám (VNĐ)</th>
                <th>Đánh giá TB</th>
                <th>Lượt khám</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={d.id}>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%',
                      background: i < 3 ? ['#fbbf24', '#9ca3af', '#d97706'][i] : 'var(--color-bg)',
                      color: i < 3 ? '#fff' : 'var(--color-text)',
                      fontWeight: 700, fontSize: 13,
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div className={styles.avatarCell}>
                      <img src={d.avatarUrl} alt={d.fullName} className={styles.avatar} />
                      <span>{d.fullName}</span>
                    </div>
                  </td>
                  <td>{d.specialtyName}</td>
                  <td>{formatCurrency(d.clinicFee)} ₫</td>
                  <td>★ {d.averageRating.toFixed(1)}</td>
                  <td>{d.totalReviews}</td>
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
