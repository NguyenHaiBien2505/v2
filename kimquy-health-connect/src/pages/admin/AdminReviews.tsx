import { useEffect, useState } from 'react';
import { FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminSidebar } from './adminSidebar';
import { type Review } from '../../data/mockData';
import { deleteReview, getAdminReviewsAggregate } from '../../services/healthApi';
import styles from './Admin.module.css';

interface ReviewItem extends Review { hidden?: boolean; doctorName?: string }

const AdminReviews = () => {
  const [list, setList] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    getAdminReviewsAggregate()
      .then((items) => setList(items.map((r) => ({ ...r, hidden: false }))))
      .catch(() => setList([]));
  }, []);

  const filtered = list.filter(r =>
    filter === 'ALL' || (filter === 'VISIBLE' ? !r.hidden : r.hidden)
  );

  const toggle = (id: number) => setList(list.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const remove = () => {
    if (deleteTargetId === null) return;
    deleteReview(deleteTargetId).catch(() => null);
    setList(list.filter((r) => r.id !== deleteTargetId));
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
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
                <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => openDeleteConfirm(r.id)}><FiTrash2 /></button>
              </div>
            </div>
            <p style={{ margin: 0, color: r.hidden ? 'var(--color-text-light)' : 'var(--color-text)', fontStyle: r.hidden ? 'italic' : 'normal' }}>
              {r.comment} {r.hidden && '(đã ẩn)'}
            </p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isDangerous={true}
        onConfirm={remove}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </DashboardLayout>
  );
};

export default AdminReviews;
