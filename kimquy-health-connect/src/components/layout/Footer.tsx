import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FaHospitalAlt } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Thông tin phòng khám */}
        <div className={styles.brand}>
          <h3><FaHospitalAlt /> Phòng Khám Kim Quy</h3>
          <p>
            Phòng khám đa khoa Kim Quy – Chăm sóc sức khỏe toàn diện với đội ngũ
            bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div>
          <h4 className={styles.colTitle}>Liên kết</h4>
          <Link to="/doctors" className={styles.footerLink}>Đội ngũ bác sĩ</Link>
          <Link to="/services" className={styles.footerLink}>Dịch vụ khám</Link>
          <Link to="/blog" className={styles.footerLink}>Tin tức sức khỏe</Link>
          <Link to="/patient/booking" className={styles.footerLink}>Đặt lịch khám</Link>
        </div>

        {/* Chuyên khoa */}
        <div>
          <h4 className={styles.colTitle}>Chuyên khoa</h4>
          <Link to="/doctors?specialty=1" className={styles.footerLink}>Nội tổng quát</Link>
          <Link to="/doctors?specialty=3" className={styles.footerLink}>Nhi khoa</Link>
          <Link to="/doctors?specialty=4" className={styles.footerLink}>Da liễu</Link>
          <Link to="/doctors?specialty=5" className={styles.footerLink}>Răng hàm mặt</Link>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 className={styles.colTitle}>Liên hệ</h4>
          <div className={styles.contactItem}>
            <FiMapPin />
            <span>123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
          </div>
          <div className={styles.contactItem}>
            <FiPhone />
            <span>(028) 1234 5678 – Hotline: 0901 234 567</span>
          </div>
          <div className={styles.contactItem}>
            <FiMail />
            <span>info@phongkhamkimquy.vn</span>
          </div>
          <div className={styles.contactItem}>
            <FiClock />
            <span>T2 – T7: 7:00 – 17:00 | CN: 7:00 – 12:00</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span>© 2026 Phòng Khám Kim Quy. Tất cả quyền được bảo lưu.</span>
        <div className={styles.socials}>
          <button className={styles.socialBtn} aria-label="Facebook"><FaFacebookF /></button>
          <button className={styles.socialBtn} aria-label="YouTube"><FaYoutube /></button>
          <button className={styles.socialBtn} aria-label="Instagram"><FaInstagram /></button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
