// src/pages/ServicesPage.tsx
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { services } from '../data/mockData';
import styles from './DoctorsPage.module.css';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
  const navigate = useNavigate();

  const handleBookService = (serviceId: number) => {
    // Navigate to booking page instead of direct payment
    navigate(`/services/${serviceId}/book`);
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.banner}>
        <h1>Dịch vụ khám</h1>
        <p>Đa dạng gói khám phù hợp với mọi nhu cầu</p>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {services.map((s) => (
            <div className={styles.card} key={s.id} style={{ cursor: 'default' }}>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{s.name}</div>
                <div className={styles.cardDegree}>{s.description}</div>
                <div className={styles.cardMeta} style={{ marginTop: '1rem' }}>
                  <span className={styles.fee}>{s.price.toLocaleString('vi-VN')}₫</span>
                  <span>{s.durationMinutes} phút</span>
                </div>
                <div style={{ display: 'grid', gap: 8, marginTop: '0.75rem' }}>
                  <button
                    className={styles.cardBtn}
                    onClick={() => handleBookService(s.id)}
                    style={{ marginTop: 0 }}
                  >
                    Đặt dịch vụ
                  </button>
                  <button
                    className={styles.cardBtn}
                    onClick={() => navigate('/patient/booking')}
                    style={{ background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                  >
                    Đặt lịch khám
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;