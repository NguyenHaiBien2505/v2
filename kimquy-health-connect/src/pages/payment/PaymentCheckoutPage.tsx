// src/pages/PaymentCheckoutPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiShield, FiSmartphone, FiCalendar, FiClock } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './PaymentCheckoutPage.module.css';

type BookingInfo = {
  date: string;
  time: string;
  serviceName?: string;
};

type PendingPayment = {
  orderCode: number;
  amount: number;
  description: string;
  status: string;
  qrCode?: string;
  checkoutUrl: string;
  source?: 'appointment' | 'medical-service';
  bookingInfo?: BookingInfo;
};

const STORAGE_KEY = 'pendingPayment';

const PaymentCheckoutPage = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      navigate('/patient/appointments', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PendingPayment;
      setPayment(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      navigate('/patient/appointments', { replace: true });
    }
  }, [navigate]);

  const qrImageSrc = useMemo(() => {
    const qrCode = payment?.qrCode?.trim() ?? '';

    if (
      qrCode &&
      (qrCode.startsWith('data:image/') || qrCode.startsWith('http://') || qrCode.startsWith('https://'))
    ) {
      return qrCode;
    }

    const fallbackValue = payment?.checkoutUrl?.trim() || String(payment?.orderCode ?? '');
    if (!fallbackValue) {
      return '';
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(fallbackValue)}`;
  }, [payment]);

  const goToPayOS = () => {
    if (!payment?.checkoutUrl) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = payment.checkoutUrl;
  };

  if (!payment) {
    return null;
  }

  const isMedicalService = payment.source === 'medical-service';
  const backLink = isMedicalService ? '/services' : '/patient/appointments';
  const backLabel = isMedicalService ? 'Quay lại danh sách dịch vụ' : 'Xem danh sách lịch hẹn';

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.eyebrow}>PAYMENT CHECKOUT</div>
          <h1>Thanh toán đơn hàng</h1>
          <p>Kiểm tra thông tin bên dưới và mở cổng thanh toán PayOS để hoàn tất giao dịch.</p>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Thông tin thanh toán</h2>
            <div className={styles.infoRow}>
              <span>Mã đơn hàng</span>
              <strong>{payment.orderCode}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Số tiền</span>
              <strong>{payment.amount.toLocaleString('vi-VN')} ₫</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Nội dung</span>
              <strong>{payment.description}</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Trạng thái</span>
              <strong>{payment.status}</strong>
            </div>
            
            {/* Hiển thị thông tin đặt lịch cho Medical Service */}
            {payment.bookingInfo && (
              <>
                <div className={styles.infoRow}>
                  <span>Dịch vụ</span>
                  <strong>{payment.bookingInfo.serviceName || 'Dịch vụ y tế'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>
                    <FiCalendar style={{ marginRight: '0.5rem' }} />
                    Ngày thực hiện
                  </span>
                  <strong>{payment.bookingInfo.date}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>
                    <FiClock style={{ marginRight: '0.5rem' }} />
                    Giờ thực hiện
                  </span>
                  <strong>{payment.bookingInfo.time}</strong>
                </div>
              </>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.primaryBtn} onClick={goToPayOS}>
                <FiExternalLink />
                Mở cổng thanh toán
              </button>
              <button type="button" className={styles.secondaryBtn} onClick={() => navigate(-1)}>
                <FiArrowLeft />
                Quay lại
              </button>
            </div>
          </article>

          <article className={styles.card}>
            <h2>QR thanh toán</h2>
            {qrImageSrc ? (
              <div className={styles.qrWrap}>
                <img src={qrImageSrc} alt="QR thanh toán PayOS" className={styles.qrImage} />
                <p>Quét mã bằng app ngân hàng hoặc ví điện tử để thanh toán.</p>
              </div>
            ) : (
              <div className={styles.qrFallback}>
                <FiSmartphone />
                <p>Chưa có QR từ backend. Bạn có thể mở cổng thanh toán bằng nút bên trái.</p>
              </div>
            )}
          </article>
        </section>

        <section className={styles.hints}>
          <div className={styles.hint}>
            <FiShield /> Giao dịch sẽ tự cập nhật trạng thái về backend sau khi PayOS callback.
          </div>
          <div className={styles.hint}>
            <FiSmartphone /> Nếu bạn bấm hủy trên cổng thanh toán, hệ thống sẽ dẫn về màn hình thất bại.
          </div>
        </section>

        <div className={styles.bottomLink}>
          <Link to={backLink}>{backLabel}</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCheckoutPage;