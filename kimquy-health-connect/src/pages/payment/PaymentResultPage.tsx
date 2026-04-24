import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiHome, FiRefreshCw } from 'react-icons/fi';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './PaymentResultPage.module.css';

type PaymentResultPageProps = {
  mode: 'success' | 'cancel';
};

const PaymentResultPage = ({ mode }: PaymentResultPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentSource, setPaymentSource] = useState<'appointment' | 'medical-service'>('appointment');

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderCode = query.get('orderCode') ?? query.get('order_id') ?? query.get('orderCodeId') ?? '';
  const amount = query.get('amount') ?? '';
  const message = query.get('message') ?? query.get('msg') ?? '';

  useEffect(() => {
    // Detect payment source from localStorage or URL
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (pendingPayment) {
      try {
        const parsed = JSON.parse(pendingPayment);
        if (parsed.source === 'medical-service') {
          setPaymentSource('medical-service');
        }
      } catch (e) {
        // fallback to appointment
      }
    }
    localStorage.removeItem('pendingPayment');
  }, []);

  const isSuccess = mode === 'success';
  const title = isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất';
  const description = isSuccess
    ? paymentSource === 'medical-service'
      ? 'Hệ thống đã ghi nhận giao dịch mua dịch vụ. Bạn có thể kiểm tra lịch sử mua hàng hoặc tiếp tục duyệt dịch vụ khác.'
      : 'Hệ thống đã ghi nhận giao dịch và cập nhật trạng thái ở backend.'
    : 'Bạn có thể thử lại hoặc quay về để thanh toán sau.';

  const returnPath = paymentSource === 'medical-service' ? '/services' : '/patient/appointments';
  const returnLabel = paymentSource === 'medical-service' ? 'Về dịch vụ' : 'Về lịch hẹn';

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>{isSuccess ? 'PAYMENT OK' : 'PAYMENT STOPPED'}</div>
          <div className={styles.heroIconWrap} data-state={mode}>
            {isSuccess ? <FiCheckCircle className={styles.heroIcon} /> : <FiAlertTriangle className={styles.heroIcon} />}
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
          {message && <div className={styles.inlineNote}>{message}</div>}
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Thông tin giao dịch</h2>
            <div className={styles.metaRow}><span>Mã đơn hàng</span><strong>{orderCode || 'Chưa có'}</strong></div>
            <div className={styles.metaRow}><span>Số tiền</span><strong>{amount ? `${Number(amount).toLocaleString('vi-VN')} ₫` : 'Chưa có'}</strong></div>
            <div className={styles.metaRow}><span>Loại</span><strong>{paymentSource === 'medical-service' ? 'Dịch vụ' : 'Lịch khám'}</strong></div>
            <div className={styles.metaRow}><span>Trạng thái</span><strong>{isSuccess ? 'Đã xử lý' : 'Bị huỷ'}</strong></div>
          </article>

          <article className={styles.card}>
            <h2>Bạn có thể làm gì tiếp theo</h2>
            <ul className={styles.steps}>
              {paymentSource === 'medical-service' ? (
                <>
                  <li>Kiểm tra lịch sử mua dịch vụ trong tài khoản.</li>
                  <li>Tiếp tục duyệt các dịch vụ khác.</li>
                  <li>Liên hệ hỗ trợ nếu cần hỗ trợ thêm.</li>
                </>
              ) : (
                <>
                  <li>Vào lịch hẹn để kiểm tra trạng thái mới nhất.</li>
                  <li>Nếu cần, thanh toán lại từ trang chi tiết lịch hẹn.</li>
                  <li>Liên hệ hỗ trợ nếu giao dịch đã trừ tiền nhưng chưa cập nhật.</li>
                </>
              )}
            </ul>
          </article>
        </section>

        <section className={styles.actions}>
          <button type="button" className={styles.primaryBtn} onClick={() => navigate(returnPath)}>
            <FiArrowLeft />
            {returnLabel}
          </button>
          <Link to="/" className={styles.secondaryBtn}>
            <FiHome />
            Về trang chủ
          </Link>
          {!isSuccess && (
            <button type="button" className={styles.ghostBtn} onClick={() => window.location.reload()}>
              <FiRefreshCw />
              Thử lại
            </button>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentResultPage;