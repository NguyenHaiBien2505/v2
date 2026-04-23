import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaBriefcase, FaMoneyBillWave, FaCertificate, FaIdBadge } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { doctors, reviews, generateTimeSlots } from '../data/mockData.ts';
import styles from './DoctorDetailPage.module.css';

const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = doctors.find((d) => String(d.id) === String(id));

  if (!doctor) return <div className={styles.page}><Header /><div className={styles.container}><p>Không tìm thấy bác sĩ.</p></div></div>;

  const slots = generateTimeSlots('2026-04-20');

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <div className={styles.top}>
          <img src={doctor.avatarUrl} alt={doctor.fullName} className={styles.avatar} />
          <div className={styles.info}>
            <h1 className={styles.name}>{doctor.fullName}</h1>
            <div className={styles.degree}>{doctor.degree}</div>
            <div className={styles.spec}>{doctor.specialty.name}</div>
            <div className={styles.meta}>
              <span className={styles.metaItem}><FaBriefcase /> {doctor.experienceYears} năm kinh nghiệm</span>
              <span className={styles.metaItem}><FaStar style={{ color: '#FFC107' }} /> {doctor.avgRating} ({doctor.totalReviews} đánh giá)</span>
              <span className={styles.metaItem}><FaMoneyBillWave /> {doctor.clinicFee.toLocaleString('vi-VN')}₫</span>
              <span className={styles.metaItem} title="Số chứng chỉ hành nghề"><FaIdBadge /> CCHN: {doctor.licenseNumber}</span>
            </div>
            <p className={styles.bio}>{doctor.bio}</p>
            <button className={styles.btnBook} onClick={() => navigate('/patient/booking')}>
              <FaClock style={{ marginRight: 6, verticalAlign: 'middle' }} /> Đặt lịch với bác sĩ này
            </button>
          </div>
        </div>

        {/* Bằng cấp & chứng chỉ */}
        {doctor.certificates && doctor.certificates.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>Bằng cấp & chứng chỉ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {doctor.certificates.map(c => (
                <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem', background: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <FaCertificate style={{ color: 'var(--color-primary)', fontSize: 24, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-light)' }}>{c.issuedBy}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>Năm cấp: {c.issuedYear}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lịch làm việc */}
        <h2 className={styles.sectionTitle}>Lịch làm việc tuần này</h2>
        <div className={styles.scheduleGrid}>
          {days.map((day, idx) => (
            <div className={styles.dayCol} key={day}>
              <div className={styles.dayLabel}>{day}</div>
              {idx === 0 ? (
                <div className={`${styles.slot} ${styles.slotBooked}`}>Nghỉ</div>
              ) : (
                slots.slice(0, 6).map((s) => (
                  <div
                    key={s.time}
                    className={`${styles.slot} ${s.available ? styles.slotAvailable : styles.slotBooked}`}
                  >
                    {s.time}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Đánh giá */}
        <h2 className={styles.sectionTitle}>Đánh giá từ bệnh nhân ({doctor.totalReviews})</h2>
        {reviews.map((r) => (
          <div className={styles.reviewCard} key={r.id}>
            <div className={styles.reviewHeader}>
              <div>
                <span className={styles.reviewName}>{r.patientName}</span>
                <span className={styles.reviewDate}> • {r.createdAt}</span>
              </div>
              <div className={styles.reviewStars}>
                {Array.from({ length: r.rating }, (_, i) => <FaStar key={i} />)}
              </div>
            </div>
            <p className={styles.reviewComment}>{r.comment}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorDetailPage;
