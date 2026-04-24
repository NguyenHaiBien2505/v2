import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { services } from '../data/mockData';
import { createMedicalServicePayment } from '../services/healthApi';
import styles from './DoctorsPage.module.css';
import { useState } from 'react';

const ServicesPage = () => {
  const [payingId, setPayingId] = useState<number | null>(null);

  const handlePay = async (serviceId: number) => {
    try {
      setPayingId(serviceId);
      const payment = await createMedicalServicePayment(serviceId);
      if (!payment.checkoutUrl) {
        throw new Error('Backend did not return checkoutUrl');
      }
      window.location.href = payment.checkoutUrl;
    } catch (error) {
      console.error(error);
      alert('Không tạo được link thanh toán cho dịch vụ này.');
    } finally {
      setPayingId(null);
    }
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
                    onClick={() => handlePay(s.id)}
                    disabled={payingId === s.id}
                    style={{ marginTop: 0 }}
                  >
                    {payingId === s.id ? 'Đang tạo link...' : 'Thanh toán ngay'}
                  </button>
                  <button
                    className={styles.cardBtn}
                    onClick={() => window.location.href = '/patient/booking'}
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
