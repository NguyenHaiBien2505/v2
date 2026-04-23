import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { MedicalRecord } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getPatientMedicalRecords } from '../../services/healthApi';
import dashStyles from './PatientDashboard.module.css';
import styles from './PatientMedicalRecords.module.css';

const PatientMedicalRecords = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getPatientMedicalRecords(profile.id).catch(() => []);
      setMedicalRecords(data);
    };

    load();
  }, [profile?.id]);

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={dashStyles.pageTitle}>Hồ sơ khám bệnh & đơn thuốc</h1>
      {medicalRecords.length === 0 ? (
        <div className={styles.empty}>
          <FiFileText size={40} />
          <p>Chưa có hồ sơ khám bệnh nào</p>
        </div>
      ) : (
        medicalRecords.map((r) => (
          <div key={r.id} className={styles.recordCard}>
            <img src={r.doctorAvatar} alt={r.doctorName} />
            <div className={styles.recordInfo}>
              <div className={styles.recordTitle}>{r.specialtyName} – {r.visitDate}</div>
              <div className={styles.recordMeta}>Bác sĩ: {r.doctorName}</div>
              <div className={styles.diagnosis}><strong>Chẩn đoán:</strong> {r.diagnosis}</div>
            </div>
            <Link to={`/patient/medical-records/${r.id}`}>
              <button className={styles.viewBtn}>Xem chi tiết</button>
            </Link>
          </div>
        ))
      )}
    </DashboardLayout>
  );
};

export default PatientMedicalRecords;
