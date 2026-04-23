import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import type { Appointment } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAppointments } from '../../services/healthApi';
import styles from './DoctorPatients.module.css';

interface PatientSummary {
  patientId: number | string;
  totalVisits: number;
  lastVisit: string;
  lastService: string;
}

const getPatients = (appointments: Appointment[]): PatientSummary[] => {
  const map = new Map<string, PatientSummary>();
  appointments.forEach((a) => {
    const key = String(a.patientId);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { patientId: a.patientId, totalVisits: 1, lastVisit: a.appointmentDate, lastService: a.serviceName });
    } else {
      existing.totalVisits++;
      if (a.appointmentDate > existing.lastVisit) {
        existing.lastVisit = a.appointmentDate;
        existing.lastService = a.serviceName;
      }
    }
  });
  return Array.from(map.values());
};

const DoctorPatients = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getDoctorAppointments(profile.id).catch(() => []);
      setAppointments(data);
    };

    load();
  }, [profile?.id]);

  const patients = useMemo(() => getPatients(appointments), [appointments]);

  const filtered = patients.filter(p =>
    `Bệnh nhân #${p.patientId}`.toLowerCase().includes(search.toLowerCase())
  );

  const patientHistory = selectedPatient !== null
    ? appointments.filter((a) => String(a.patientId) === selectedPatient)
    : [];

  if (selectedPatient !== null) {
    return (
      <DashboardLayout sections={doctorSidebar}>
        <button className={styles.btnBack} onClick={() => setSelectedPatient(null)}>
          <FiArrowLeft /> Quay lại danh sách
        </button>
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div>
              <h2>Bệnh nhân #{selectedPatient}</h2>
              <div className={styles.detailMeta}>{patientHistory.length} lần khám</div>
            </div>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Lịch sử khám</h3>
          <ul className={styles.historyList}>
            {patientHistory.map(a => (
              <li key={a.id} className={styles.historyItem}>
                <div>
                  <div className={styles.historyDate}>{a.appointmentDate} | {a.startTime}</div>
                  <div className={styles.historyService}>{a.serviceName} – {a.reason}</div>
                </div>
                <span className={`status-badge status-badge--${a.status.toLowerCase()}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Danh sách bệnh nhân</h1>
      <div className={styles.searchBar}>
        <input className={styles.searchInput} placeholder="Tìm bệnh nhân..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr><th>Bệnh nhân</th><th>Số lần khám</th><th>Lần khám cuối</th><th>Dịch vụ gần nhất</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.patientId}>
                <td style={{ fontWeight: 600 }}>Bệnh nhân #{p.patientId}</td>
                <td>{p.totalVisits}</td>
                <td>{p.lastVisit}</td>
                <td>{p.lastService}</td>
                <td><button className={styles.btnView} onClick={() => setSelectedPatient(String(p.patientId))}>Xem hồ sơ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
