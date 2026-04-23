import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { type Banner } from '../../data/mockData';
import { createAdminBanner, deleteAdminBanner, getAdminBanners, updateAdminBanner } from '../../services/healthApi';
import styles from './Admin.module.css';

const AdminBanners = () => {
  const [list, setList] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Partial<Banner>>({ sortOrder: 0, isActive: true });

  const openAdd = () => { setEditing(null); setForm({ sortOrder: list.length + 1, isActive: true }); setShowModal(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm(b); setShowModal(true); };
  const remove = async (id: number) => {
    if (!confirm('Xóa banner này?')) return;
    await deleteAdminBanner(id);
    setList(list.filter(b => b.id !== id));
  };
  const toggle = async (id: number) => {
    const target = list.find((b) => b.id === id);
    if (!target) return;
    const updated = await updateAdminBanner(id, {
      title: target.title || 'Banner',
      subtitle: target.subtitle,
      imageUrl: target.imageUrl,
      linkUrl: target.linkUrl,
      sortOrder: target.sortOrder,
      isActive: !target.isActive,
    });
    setList(list.map((b) => (b.id === id ? updated : b)));
  };
  const save = async () => {
    if (!form.imageUrl) return;
    if (editing) {
      const updated = await updateAdminBanner(editing.id, {
        title: form.title || 'Banner',
        subtitle: form.subtitle,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
        sortOrder: Number(form.sortOrder ?? 0),
        isActive: Boolean(form.isActive),
      });
      setList(list.map((b) => (b.id === editing.id ? updated : b)));
    } else {
      const created = await createAdminBanner({
        title: form.title || 'Banner',
        subtitle: form.subtitle,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
        sortOrder: Number(form.sortOrder ?? 0),
        isActive: Boolean(form.isActive),
      });
      setList([...list, created]);
    }
    setShowModal(false);
  };

  useEffect(() => {
    getAdminBanners().then(setList).catch(() => setList([]));
  }, []);

  const sorted = [...list].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý banner</h1>
      <p className={styles.pageSubtitle}>Banner xuất hiện trên trang chủ ({list.filter(b => b.isActive).length}/{list.length} đang bật)</p>

      <div className={styles.toolbar}>
        <div style={{ flex: 1 }} />
        <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Thêm banner</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>STT</th><th>Ảnh</th><th>Tiêu đề</th><th>Liên kết</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {sorted.map(b => (
                <tr key={b.id}>
                  <td>{b.sortOrder}</td>
                  <td><img src={b.imageUrl} alt={b.title || ''} style={{ width: 120, height: 50, objectFit: 'cover', borderRadius: 4 }} /></td>
                  <td>
                    <strong>{b.title || '—'}</strong>
                    {b.subtitle && <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{b.subtitle}</div>}
                  </td>
                  <td style={{ fontSize: 12 }}>{b.linkUrl || '—'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${b.isActive ? styles.statusConfirmed : styles.statusCancelled}`}>
                      {b.isActive ? 'Đang bật' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => toggle(b.id)} title={b.isActive ? 'Tắt' : 'Bật'}>
                        {b.isActive ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button className={styles.btnIcon} onClick={() => openEdit(b)}><FiEdit2 /></button>
                      <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => remove(b.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Sửa banner' : 'Thêm banner'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>URL ảnh *</label>
                <input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tiêu đề</label>
                  <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Thứ tự</label>
                  <input type="number" value={form.sortOrder ?? 0} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Phụ đề</label>
                <input value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Link đích</label>
                <input value={form.linkUrl || ''} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="/services" />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input type="checkbox" checked={!!form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 'auto', marginRight: 8 }} />
                  Hiển thị banner
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={save}>{editing ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBanners;
