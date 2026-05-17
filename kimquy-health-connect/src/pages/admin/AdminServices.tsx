import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminSidebar } from './adminSidebar';
import { type Service } from '../../data/mockData';
import { getAllMedicalServices, createMedicalServiceApi, updateMedicalServiceApi, deleteMedicalServiceApi, getAllSpecialties } from '../../services/healthApi';
import styles from './Admin.module.css';

const AdminServices = () => {
  const [list, setList] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Array<{ id: number; name: string }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({ price: 0, durationMinutes: 30 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setForm({ price: 0, durationMinutes: 30 }); setShowModal(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm(s); setShowModal(true); };
  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const remove = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteMedicalServiceApi(deleteTargetId);
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
        await updateMedicalServiceApi(editing.id as number, { name: form.name!, description: form.description, price: String(form.price ?? 0), category: undefined, icon: undefined, image: undefined });
      } else {
        await createMedicalServiceApi({ name: form.name!, description: form.description, price: String(form.price ?? 0) });
      }
      setLoading(true); setError(null);
      const items = await getAllMedicalServices();
      setList(items.map((s: any) => ({ id: s.id, name: s.name, description: s.description ?? '', price: Number(s.price ?? 0), durationMinutes: 30, specialtyId: undefined })));
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
        const [items, spItems] = await Promise.all([getAllMedicalServices(), getAllSpecialties()]);
        if (!mounted) return;
        setList(items.map((s: any) => ({ id: s.id, name: s.name, description: s.description ?? '', price: Number(s.price ?? 0), durationMinutes: 30, specialtyId: undefined })));
        setSpecialties(spItems.map((s) => ({ id: s.id, name: s.name })));
      } catch (err: any) {
        setError(err?.message || 'Không thể tải dịch vụ');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý dịch vụ</h1>
      <p className={styles.pageSubtitle}>Tổng cộng {list.length} dịch vụ</p>

      <div className={styles.toolbar}>
        <div style={{ flex: 1 }} />
        <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Thêm dịch vụ</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>STT</th><th>Tên dịch vụ</th><th>Chuyên khoa</th><th>Mô tả</th><th>Thời lượng</th><th>Giá</th><th>Thao tác</th></tr></thead>
            <tbody>
              {list.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{specialties.find(sp => sp.id === s.specialtyId)?.name || <em style={{ color: 'var(--color-text-light)' }}>Chưa gán</em>}</td>
                  <td>{s.description}</td>
                  <td>{s.durationMinutes} phút</td>
                  <td>{s.price.toLocaleString()}đ</td>
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
              <h2>{editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tên dịch vụ *</label>
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Chuyên khoa</label>
                <select value={form.specialtyId ?? ''} onChange={e => setForm({ ...form, specialtyId: e.target.value ? +e.target.value : undefined })}>
                  <option value="">— Chưa gán —</option>
                  {specialties.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giá (VNĐ)</label>
                  <input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: +e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Thời lượng (phút)</label>
                  <input type="number" value={form.durationMinutes || 0} onChange={e => setForm({ ...form, durationMinutes: +e.target.value })} />
                </div>
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
        title="Xóa dịch vụ"
        message="Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác."
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

export default AdminServices;
