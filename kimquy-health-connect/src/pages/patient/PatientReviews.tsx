import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { Review } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getPatientReviews } from '../../services/healthApi';
import styles from './PatientDashboard.module.css';

const PatientReviews = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getPatientReviews(profile.id).catch(() => []);
      setReviews(data);
    };

    load();
  }, [profile?.id]);

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={styles.pageTitle}>Đánh giá của tôi</h1>
      <div className={styles.tableCard}>
        {reviews.map((r) => (
          <div key={r.id} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong>{r.doctorName || 'Bác sĩ'}</strong>
              <span style={{ color: '#FFC107', display: 'flex', gap: 2 }}>
                {Array.from({ length: r.rating }, (_, i) => <FaStar key={i} />)}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{r.comment}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{r.createdAt}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PatientReviews;
