import { useEffect, useState } from 'react';
import { FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { type Review } from '../../data/mockData';
import { deleteReview, getAdminReviewsAggregate } from '../../services/healthApi';
import styles from './Admin.module.css';

interface ReviewItem extends Review { hidden?: boolean; doctorName?: string }

const AdminReviews = () => {
  const [list, setList] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');

  useEffect(() => {
    getAdminReviewsAggregate()
      .then((items) => setList(items.map((r) => ({ ...r, hidden: false }))))
      .catch(() => setList([]));
  }, []);

  const filtered = list.filter(r =>
    filter === 'ALL' || (filter === 'VISIBLE' ? !r.hidden : r.hidden)
  );

  const toggle = (id: number) => setList(list.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  const remove = (id: number) => {
    if (!confirm('Xóa đánh giá này?')) return;
    deleteReview(id).catch(() => null);
    setList(list.filter((r) => r.id !== id));
  };

  const avgRating = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : '0';

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý đánh giá</h1>
      <p className={styles.pageSubtitle}>{list.length} đánh giá · Trung bình ★ {avgRating}/5</p>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map(f => (
            <button key={f} className={`${styles.filterChip} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'Tất cả' : f === 'VISIBLE' ? 'Đang hiển thị' : 'Đã ẩn'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelCard}>
        {filtered.map(r => (
          <div key={r.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <strong>{r.patientName}</strong>
                <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>Đánh giá BS: {r.doctorName} · {r.createdAt}</div>
              </div>
              <div className={styles.actions}>
                <span className={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <button className={styles.btnIcon} onClick={() => toggle(r.id)} title={r.hidden ? 'Hiện' : 'Ẩn'}>
                  {r.hidden ? <FiEye /> : <FiEyeOff />}
                </button>
                <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => remove(r.id)}><FiTrash2 /></button>
              </div>
            </div>
            <p style={{ margin: 0, color: r.hidden ? 'var(--color-text-light)' : 'var(--color-text)', fontStyle: r.hidden ? 'italic' : 'normal' }}>
              {r.comment} {r.hidden && '(đã ẩn)'}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminReviews;
