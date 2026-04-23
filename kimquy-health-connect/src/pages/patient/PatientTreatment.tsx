import { useEffect, useMemo, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { MedicalRecord, TreatmentPlan } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getPatientMedicalRecords } from '../../services/healthApi';
import dashStyles from './PatientDashboard.module.css';
import styles from './PatientTreatment.module.css';

const statusLabel: Record<string, string> = { ACTIVE: 'Đang điều trị', COMPLETED: 'Hoàn thành', PAUSED: 'Tạm dừng' };
const statusClass: Record<string, string> = { ACTIVE: styles.statusActive, COMPLETED: styles.statusCompleted, PAUSED: styles.statusPaused };

const PatientTreatment = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getPatientMedicalRecords(profile.id).catch(() => []);
      setRecords(data);
    };

    load();
  }, [profile?.id]);

  const treatmentPlans = useMemo<TreatmentPlan[]>(() => {
    if (!records.length) return [];
    const sorted = [...records].sort((a, b) => a.visitDate.localeCompare(b.visitDate));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return [
      {
        id: Number(first.id),
        patientId: first.patientId,
        title: first.specialtyName || 'Theo doi dieu tri',
        doctorName: first.doctorName,
        specialtyName: first.specialtyName,
        startDate: first.visitDate,
        expectedEndDate: last.visitDate,
        status: 'ACTIVE',
        progressPercent: Math.min(100, sorted.length * 20),
        description: 'Tien trinh dieu tri duoc tong hop tu cac lan kham thuc te.',
        milestones: sorted.map((r, idx) => ({
          id: Number(r.id),
          date: r.visitDate,
          title: r.diagnosis || 'Cap nhat ho so',
          description: r.treatmentPlan || r.doctorNote || 'Khong co ghi chu.',
          status: idx === sorted.length - 1 ? 'IN_PROGRESS' : 'DONE',
          doctorName: r.doctorName,
        })),
      },
    ];
  }, [records]);

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={dashStyles.pageTitle}>Tiến trình điều trị</h1>

      {treatmentPlans.length === 0 ? (
        <div className={styles.empty}>
          <FiActivity size={40} />
          <p>Chưa có phác đồ điều trị nào</p>
        </div>
      ) : (
        treatmentPlans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <div>
                <div className={styles.planTitle}>{plan.title}</div>
                <div className={styles.planMeta}>
                  {plan.specialtyName} · BS. {plan.doctorName}
                </div>
                <div className={styles.planMeta} style={{ marginTop: 4 }}>
                  {plan.startDate} → {plan.expectedEndDate}
                </div>
              </div>
              <span className={`${styles.statusBadge} ${statusClass[plan.status]}`}>
                {statusLabel[plan.status]}
              </span>
            </div>

            <p className={styles.description}>{plan.description}</p>

            <div className={styles.progressLabel}>
              <span>Tiến độ điều trị</span>
              <span><strong>{plan.progressPercent}%</strong></span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${plan.progressPercent}%` }} />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Các mốc điều trị</h3>
            <div className={styles.timeline}>
              {plan.milestones.map((m) => (
                <div key={m.id} className={styles.tlItem}>
                  <div className={`${styles.tlDot} ${m.status === 'DONE' ? styles.tlDotDone : ''} ${m.status === 'IN_PROGRESS' ? styles.tlDotProgress : ''}`} />
                  <div className={styles.tlDate}>{m.date}</div>
                  <div className={styles.tlTitle}>{m.title}</div>
                  <div className={styles.tlDesc}>{m.description}</div>
                  {m.doctorName && <div className={styles.tlDoctor}>👨‍⚕️ {m.doctorName}</div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </DashboardLayout>
  );
};

export default PatientTreatment;
