import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCheck, FiClock } from 'react-icons/fi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { createMedicalServicePayment, getMedicalService } from '../services/healthApi';
import styles from './MedicalServiceBookingPage.module.css';

interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  price: number;
}

const MedicalServiceBookingPage = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await getMedicalService(Number(serviceId));
        setService(data);

        const dates: string[] = [];
        const today = new Date();
        for (let i = 1; i <= 30; i += 1) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          if (date.getDay() !== 0) {
            dates.push(date.toISOString().split('T')[0]);
          }
        }
        setAvailableDates(dates);
      } catch (error) {
        console.error('Failed to load service:', error);
        alert('Khong the tai thong tin dich vu');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [navigate, serviceId]);

  useEffect(() => {
    if (!selectedDate) return;

    setAvailableTimes([
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    ]);
    setSelectedTime('');
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert('Vui long chon ngay thuc hien dich vu');
      return;
    }
    if (!selectedTime) {
      alert('Vui long chon gio thuc hien dich vu');
      return;
    }

    setSubmitting(true);
    try {
      localStorage.setItem(
        'medicalServiceBooking',
        JSON.stringify({
          serviceId: service?.id,
          serviceName: service?.name,
          servicePrice: service?.price,
          selectedDate,
          selectedTime,
          createdAt: new Date().toISOString(),
        })
      );

      const payment = await createMedicalServicePayment(Number(serviceId));
      if (!payment.checkoutUrl) {
        throw new Error('Backend did not return checkoutUrl');
      }

      localStorage.setItem(
        'pendingPayment',
        JSON.stringify({
          ...payment,
          source: 'medical-service',
          bookingInfo: {
            date: selectedDate,
            time: selectedTime,
            serviceName: service?.name,
          },
        })
      );

      navigate('/payment/checkout');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Khong the tao thanh toan';
      if (message.toLowerCase().includes('unauthenticated')) {
        alert('Ban can dang nhap de thanh toan dich vu.');
        navigate('/login');
        return;
      }
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Dang tai thong tin dich vu...</div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>Khong tim thay dich vu</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <button className={styles.backBtn} onClick={() => navigate('/services')}>
            <FiArrowLeft /> Quay lai danh sach dich vu
          </button>

          <div className={styles.serviceInfo}>
            <h1>{service.name}</h1>
            <p className={styles.description}>{service.description}</p>
            <div className={styles.price}>
              Gia: <strong>{service.price.toLocaleString('vi-VN')} VND</strong>
            </div>
          </div>

          <div className={styles.bookingForm}>
            <h2>Thong tin dat dich vu</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FiCalendar /> Chon ngay thuc hien <span className={styles.required}>*</span>
              </label>
              <div className={styles.datesGrid}>
                {availableDates.map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
                  const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

                  return (
                    <button
                      key={date}
                      className={`${styles.dateCard} ${selectedDate === date ? styles.dateCardSelected : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={styles.dateDay}>{dayName}</div>
                      <div className={styles.dateNum}>{dateStr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiClock /> Chon gio thuc hien <span className={styles.required}>*</span>
                </label>
                <div className={styles.timesGrid}>
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotSelected : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className={styles.summary}>
                <h3>Thong tin dat dich vu</h3>
                <div className={styles.summaryRow}>
                  <span>Dich vu:</span>
                  <strong>{service.name}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Ngay thuc hien:</span>
                  <strong>{new Date(selectedDate).toLocaleDateString('vi-VN')}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Gio thuc hien:</span>
                  <strong>{selectedTime}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tong tien:</span>
                  <strong className={styles.totalPrice}>{service.price.toLocaleString('vi-VN')} VND</strong>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || submitting}
              >
                {submitting ? 'Dang xu ly...' : (<><FiCheck /> Tien hanh thanh toan</>)}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MedicalServiceBookingPage;
