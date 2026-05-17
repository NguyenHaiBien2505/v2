import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminSidebar } from './adminSidebar';
import { type Specialty } from '../../data/mockData';
import { getAllSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../../services/healthApi';
import styles from './Admin.module.css';

const AdminSpecialties = () => {
  const [list, setList] = useState<Specialty[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [form, setForm] = useState<Partial<Specialty>>({ isActive: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setForm({ isActive: true }); setShowModal(true); };
  const openEdit = (s: Specialty) => { setEditing(s); setForm(s); setShowModal(true); };
  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const remove = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteSpecialty(deleteTargetId);
      setList(list.filter(s => s.id !== deleteTargetId));
    } catch (e) {
      alert('Xóa thất bại');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const save = async () => {
    if (!form.name) return;
    try {
      if (editing) {
        await updateSpecialty(editing.id as number, { name: form.name!, icon: form.iconUrl, description: form.description });
      } else {
        await createSpecialty({ name: form.name!, icon: form.iconUrl, description: form.description });
      }
      // refresh list
      setLoading(true); setError(null);
      const items = await getAllSpecialties();
      setList(items.map(s => ({ id: s.id, name: s.name, description: s.description ?? '', iconUrl: s.icon ?? '', isActive: Boolean(s.isActive) })));
      setShowModal(false);
    } catch (err: any) {
      alert(err?.message || 'Lưu thất bại');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const items = await getAllSpecialties();
        if (!mounted) return;
        setList(items.map(s => ({ id: s.id, name: s.name, description: s.description ?? '', iconUrl: s.icon ?? '', isActive: Boolean(s.isActive) })));
      } catch (err: any) {
        setError(err?.message || 'Không thể tải chuyên khoa');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý chuyên khoa</h1>
      <p className={styles.pageSubtitle}>Tổng cộng {list.length} chuyên khoa</p>

      <div className={styles.toolbar}>
        <div style={{ flex: 1 }} />
        <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Thêm chuyên khoa</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>STT</th><th>Tên</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {list.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.description}</td>
                  <td><span className={`${styles.statusBadge} ${s.isActive ? styles.statusActive : styles.statusInactive}`}>{s.isActive ? 'Hoạt động' : 'Tạm dừng'}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => openEdit(s)}><FiEdit2 /></button>
                      <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => openDeleteConfirm(s.id)}><FiTrash2 /></button>
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
              <h2>{editing ? 'Sửa chuyên khoa' : 'Thêm chuyên khoa'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tên chuyên khoa *</label>
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 'auto', marginRight: 8 }} />
                  Đang hoạt động
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa chuyên khoa"
        message="Bạn có chắc chắn muốn xóa chuyên khoa này? Hành động này không thể hoàn tác."
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

export default AdminSpecialties;
