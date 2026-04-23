import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorSidebar } from './DoctorDashboard';
import type { Review } from '../../data/mockData';
import { getDoctorReviews } from '../../services/healthApi';
import { useAuthStore, type DoctorProfile as DoctorProfileData } from '../../store/authStore';
import styles from './DoctorProfile.module.css';

const DoctorProfile = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile) as DoctorProfileData | null;

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [degree, setDegree] = useState(profile?.degree || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [experience, setExperience] = useState(String(profile?.experienceYears || 0));
  const [fee, setFee] = useState(String(profile?.clinicFee || 0));
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getDoctorReviews(profile.id).catch(() => []);
      setReviews(data);
    };

    load();
  }, [profile?.id]);

  return (
    <DashboardLayout sections={doctorSidebar}>
      <h1 className={styles.pageTitle}>Hồ sơ bác sĩ</h1>

      <div className={styles.profileGrid}>
        {/* Edit form */}
        <div className={styles.card}>
          <div className={styles.avatarWrap}>
            <img src={user?.avatarUrl || ''} alt={profile?.fullName} className={styles.avatar} />
            <div className={styles.avatarInfo}>
              <h3>{profile?.fullName}</h3>
              <p>{profile?.specialtyName}</p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Họ và tên</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Học hàm / Bằng cấp</label>
            <input value={degree} onChange={e => setDegree(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Số năm kinh nghiệm</label>
            <input type="number" value={experience} onChange={e => setExperience(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Phí khám (VNĐ)</label>
            <input type="number" value={fee} onChange={e => setFee(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Giới thiệu bản thân</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} />
          </div>
          <div className={styles.formGroup}>
            <label>Ảnh đại diện</label>
            <input type="file" accept="image/*" />
          </div>

          <button className={styles.btnPrimary}>Lưu thay đổi</button>
        </div>

        {/* Reviews */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Đánh giá từ bệnh nhân ({profile?.totalReviews || 0})
            <span style={{ marginLeft: '0.5rem', color: '#F9A825' }}>
              {'★'.repeat(Math.round(profile?.avgRating || 0))} {profile?.avgRating || 0}
            </span>
          </div>
          {reviews.map(r => (
            <div key={r.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewName}>{r.patientName}</span>
                <span className={styles.reviewDate}>{r.createdAt}</span>
              </div>
              <div className={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <div className={styles.reviewComment}>{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
