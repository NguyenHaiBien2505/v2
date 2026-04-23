import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { doctors, specialties } from '../data/mockData';
import styles from './DoctorsPage.module.css';

const DoctorsPage = () => {
  const [specFilter, setSpecFilter] = useState<number>(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchSpec = specFilter === 0 || d.specialty.id === specFilter;
      const matchSearch = d.fullName.toLowerCase().includes(search.toLowerCase());
      return matchSpec && matchSearch;
    });
  }, [specFilter, search]);

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.banner}>
        <h1>Đội ngũ Bác sĩ</h1>
        <p>Bác sĩ giỏi chuyên môn, tận tâm với bệnh nhân</p>
      </div>
      <div className={styles.container}>
        <div className={styles.filters}>
          <select className={styles.filterSelect} value={specFilter} onChange={(e) => setSpecFilter(+e.target.value)}>
            <option value={0}>Tất cả chuyên khoa</option>
            {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            className={styles.searchInput}
            placeholder="Tìm theo tên bác sĩ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.grid}>
          {filtered.map((doc) => (
            <div className={styles.card} key={doc.id}>
              <img src={doc.avatarUrl} alt={doc.fullName} className={styles.cardImg} />
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{doc.fullName}</div>
                <div className={styles.cardDegree}>{doc.degree}</div>
                <div className={styles.cardSpec}>{doc.specialty.name} • {doc.experienceYears} năm kinh nghiệm</div>
                <div className={styles.cardMeta}>
                  <span className={styles.rating}><FaStar /> {doc.avgRating} ({doc.totalReviews})</span>
                  <span className={styles.fee}>{doc.clinicFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <Link to={`/doctors/${doc.id}`}><button className={styles.cardBtn}>Xem chi tiết & Đặt lịch</button></Link>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><p>Không tìm thấy bác sĩ phù hợp.</p></div>}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorsPage;
