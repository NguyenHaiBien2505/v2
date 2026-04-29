import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiPhone, FiMail, FiMapPin, FiClock, FiArrowRight, FiMessageCircle } from 'react-icons/fi';
import { FaStethoscope, FaBaby, FaTooth, FaEye, FaHeartbeat, FaUserMd, FaStar } from 'react-icons/fa';
import { MdOutlineFace } from 'react-icons/md';
import { GiNoseSide } from 'react-icons/gi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { specialties, doctors, blogPosts } from '../data/mockData';
import styles from './Home.module.css';

const specIcons = [FaStethoscope, FaUserMd, FaBaby, MdOutlineFace, FaTooth, GiNoseSide, FaEye, FaHeartbeat];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />

      {/* Hero */}
      <section className={styles.hero} style={{ marginTop: 'var(--header-height)' }}>
        <h1 className={styles.heroTitle}>Chăm sóc sức khỏe<br />tận tâm & chuyên nghiệp</h1>
        <p className={styles.heroSub}>
          Phòng khám Kim Quy – Đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại,
          phục vụ bạn và gia đình.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.heroCta} onClick={() => navigate('/patient/booking')}>
            <FiCalendar /> Đặt lịch khám ngay
          </button>
          <button className={styles.heroSecondaryCta} onClick={() => navigate('/chatbot')}>
            <FiMessageCircle /> Trò chuyện với AI Chatbot
          </button>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <div className={styles.statNum}>15+</div>
            <div className={styles.statLabel}>Bác sĩ chuyên khoa</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>8</div>
            <div className={styles.statLabel}>Chuyên khoa</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>10,000+</div>
            <div className={styles.statLabel}>Bệnh nhân tin tưởng</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>10</div>
            <div className={styles.statLabel}>Năm hoạt động</div>
          </div>
        </div>
      </section>

      {/* Chuyên khoa */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Chuyên khoa</h2>
          <p className={styles.sectionSub}>Đa dạng chuyên khoa đáp ứng mọi nhu cầu khám chữa bệnh</p>
        </div>
        <div className={styles.specGrid}>
          {specialties.map((spec, idx) => {
            const Icon = specIcons[idx] || FaStethoscope;
            return (
              <Link to={`/doctors?specialty=${spec.id}`} className={styles.specCard} key={spec.id}>
                <div className={styles.specIcon}><Icon /></div>
                <div className={styles.specName}>{spec.name}</div>
                <div className={styles.specDesc}>{spec.description}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bác sĩ nổi bật */}
      <section className={styles.section} style={{ background: 'var(--color-bg)' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Bác sĩ nổi bật</h2>
          <p className={styles.sectionSub}>Đội ngũ bác sĩ giỏi chuyên môn, giàu kinh nghiệm</p>
        </div>
        <div className={styles.docGrid}>
          {doctors.slice(0, 3).map((doc) => (
            <Link to={`/doctors/${doc.id}`} className={styles.docCard} key={doc.id}>
              <img src={doc.avatarUrl} alt={doc.fullName} className={styles.docImg} />
              <div className={styles.docInfo}>
                <div className={styles.docName}>{doc.fullName}</div>
                <div className={styles.docSpec}>{doc.specialty.name}</div>
                <div className={styles.docRating}>
                  <span className="stars"><FaStar /></span>
                  {doc.avgRating} ({doc.totalReviews} đánh giá)
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/doctors" className={styles.viewAll}>
          Xem tất cả bác sĩ <FiArrowRight style={{ verticalAlign: 'middle' }} />
        </Link>
      </section>

      {/* Blog */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tin tức sức khỏe</h2>
          <p className={styles.sectionSub}>Cập nhật kiến thức y khoa mới nhất</p>
        </div>
        <div className={styles.blogGrid}>
          {blogPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} className={styles.blogCard} key={post.id}>
              <img src={post.thumbnailUrl} alt={post.title} className={styles.blogImg} />
              <div className={styles.blogBody}>
                <span className={styles.blogCat}>{post.category}</span>
                <div className={styles.blogTitle}>{post.title}</div>
                <div className={styles.blogDate}>{post.createdAt}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Thông tin liên hệ + Map */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Thông tin liên hệ
            </h2>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FiMapPin /></div>
              <div>
                <div className={styles.infoLabel}>Địa chỉ</div>
                <div className={styles.infoValue}>123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FiPhone /></div>
              <div>
                <div className={styles.infoLabel}>Điện thoại</div>
                <div className={styles.infoValue}>(028) 1234 5678 – Hotline: 0901 234 567</div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FiMail /></div>
              <div>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoValue}>info@phongkhamkimquy.vn</div>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><FiClock /></div>
              <div>
                <div className={styles.infoLabel}>Giờ làm việc</div>
                <div className={styles.infoValue}>Thứ 2 – Thứ 7: 7:00 – 17:00<br />Chủ nhật: 7:00 – 12:00</div>
              </div>
            </div>
          </div>
          <div>
            <iframe
              className={styles.mapFrame}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0012345!2d106.7!3d10.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzQ4LjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2s!4v1234567890"
              allowFullScreen
              loading="lazy"
              title="Bản đồ phòng khám Kim Quy"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
