import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminSidebar } from './adminSidebar';
import { type BlogPost } from '../../data/mockData';
import { createAdminNews, deleteAdminNews, getAdminNews, updateAdminNews } from '../../services/healthApi';
import styles from './Admin.module.css';

const AdminContent = () => {
  const [list, setList] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Partial<BlogPost>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ category: 'Sức khỏe', tags: [], authorName: 'Admin' }); setShowModal(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setForm(p); setShowModal(true); };
  
  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    setIsLoading(true);
    try {
      await deleteAdminNews(deleteTargetId);
      setList(list.filter(p => p.id !== deleteTargetId));
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const save = async () => {
    if (!form.title?.trim()) {
      alert('Tiêu đề bài viết không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      if (editing) {
        const updated = await updateAdminNews(editing.id, {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content ?? '',
          thumbnailUrl: form.thumbnailUrl,
          category: form.category,
          authorName: form.authorName,
          featured: true,
        });
        setList(list.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        const created = await createAdminNews({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content ?? '',
          thumbnailUrl: form.thumbnailUrl,
          category: form.category,
          authorName: form.authorName,
          featured: true,
        });
        setList([created, ...list]);
      }
      setShowModal(false);
      setForm({});
      setEditing(null);
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
      alert('Không thể lưu bài viết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAdminNews().then(setList).catch(() => setList([]));
  }, []);

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý nội dung blog</h1>
      <p className={styles.pageSubtitle}>{list.length} bài viết đã xuất bản</p>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết..." />
        </div>
        <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Viết bài mới</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Danh mục</th><th>Tác giả</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.thumbnailUrl} alt={p.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /></td>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.category}</td>
                  <td>{p.authorName}</td>
                  <td>{p.createdAt}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => openEdit(p)}><FiEdit2 /></button>
                      <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => openDeleteConfirm(p.id)}><FiTrash2 /></button>
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
              <h2>{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Danh mục</label>
                  <input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tác giả</label>
                  <input value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Ảnh thumbnail (URL)</label>
                <input value={form.thumbnailUrl || ''} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Nội dung (HTML)</label>
                <textarea style={{ minHeight: 160 }} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={save} disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Đăng bài')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </DashboardLayout>
  );
};

export default AdminContent;
