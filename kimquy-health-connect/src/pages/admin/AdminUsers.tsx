import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminSidebar } from './adminSidebar';
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser, uploadAvatar, type AdminUserRow } from '../../services/healthApi';
import styles from './Admin.module.css';

interface UserForm {
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
}

const roleLabel = (role: string) => {
  if (role === 'PATIENT') return 'Bệnh nhân';
  if (role === 'DOCTOR') return 'Bác sĩ';
  if (role === 'ADMIN') return 'Quản trị';
  return role;
};

const roleIdByName: Record<UserForm['role'], string> = {
  ADMIN: '1',
  DOCTOR: '2',
  PATIENT: '3',
};

const roleFromRow = (row: AdminUserRow): UserForm['role'] => row.role ?? 'PATIENT';

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState<UserForm>({ username: '', email: '', password: '', avatarUrl: '', role: 'PATIENT', status: 'ACTIVE' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await getAdminUsers();
      setUsers(rows);
    } catch {
      setLoadError('Không tải được danh sách tài khoản từ API. Hãy kiểm tra token đăng nhập và quyền ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => users.filter(u =>
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (u.username.toLowerCase().includes(search.toLowerCase()) || u.roles.join(' ').toLowerCase().includes(search.toLowerCase()))
  ), [users, roleFilter, search]);

  const openAdd = () => {
    setEditing(null);
    setActionError('');
    setForm({ username: '', email: '', password: '', avatarUrl: '', role: 'PATIENT', status: 'ACTIVE' });
    setShowModal(true);
  };

  const openEdit = (u: AdminUserRow) => {
    setEditing(u);
    setActionError('');
    setForm({
      username: u.username,
      email: u.email ?? '',
      password: '',
      avatarUrl: u.avatarUrl ?? '',
      role: roleFromRow(u),
      status: u.status,
    });
    setShowModal(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const remove = async () => {
    if (!deleteTargetId) return;
    try {
      setActionError('');
      await deleteAdminUser(deleteTargetId);
      await refresh();
    } catch {
      setActionError('Xóa tài khoản thất bại.');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const url = await uploadAvatar(file);
      setForm({ ...form, avatarUrl: url });
    } catch (err) {
      setActionError('Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!form.username.trim()) return setActionError('Vui lòng nhập username.');
    if (!editing && !form.password.trim()) return setActionError('Vui lòng nhập mật khẩu.');

    try {
      setSaving(true);
      setActionError('');
      if (editing) {
        await updateAdminUser(editing.id, {
          email: form.email || undefined,
          password: form.password.trim() ? form.password : undefined,
          avatarUrl: form.avatarUrl || undefined,
          status: form.status,
          roles: [roleIdByName[form.role]],
        });
      } else {
        await createAdminUser({
          username: form.username,
          email: form.email || undefined,
          password: form.password,
          avatarUrl: form.avatarUrl || undefined,
          roles: [roleIdByName[form.role]],
        });
      }
      setShowModal(false);
      await refresh();
    } catch {
      setActionError('Không thể lưu tài khoản. Hãy kiểm tra dữ liệu và quyền ADMIN.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý tài khoản</h1>
      <p className={styles.pageSubtitle}>Tổng cộng {users.length} tài khoản trong hệ thống</p>
      {loadError && (
        <div style={{ marginBottom: 12, color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 8 }}>
          {loadError}
        </div>
      )}
      {actionError && (
        <div style={{ marginBottom: 12, color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 8 }}>
          {actionError}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo username hoặc vai trò..." />
        </div>
        <div className={styles.filters}>
          {['ALL', 'PATIENT', 'DOCTOR', 'ADMIN'].map(r => (
            <button key={r} className={`${styles.filterChip} ${roleFilter === r ? styles.active : ''}`} onClick={() => setRoleFilter(r)}>
              {r === 'ALL' ? 'Tất cả' : r}
            </button>
          ))}
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Thêm tài khoản</button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>STT</th><th>Username</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6}>Đang tải dữ liệu...</td></tr>
              )}
              {!loading && filtered.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className={styles.avatarCell}>
                      {u.avatarUrl ? <img src={u.avatarUrl} alt={u.username} className={styles.avatar} /> : <div className={styles.avatar} style={{ display: 'grid', placeItems: 'center', background: 'var(--color-bg)' }}>{u.username.charAt(0).toUpperCase()}</div>}
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td>{roleLabel(u.role)}</td>
                  <td><span className={`${styles.statusBadge} ${u.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>{u.status}</span></td>
                  <td>{u.createdAt}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => openEdit(u)}><FiEdit2 /></button>
                      <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => openDeleteConfirm(u.id)}><FiTrash2 /></button>
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
              <h2>{editing ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Username *</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!editing} />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>{editing ? 'Mật khẩu mới' : 'Mật khẩu *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Để trống nếu không đổi' : ''} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Vai trò</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserForm['role'] })}>
                    <option value="PATIENT">Bệnh nhân</option>
                    <option value="DOCTOR">Bác sĩ</option>
                    <option value="ADMIN">Quản trị</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as UserForm['status'] })}>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Khóa</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Ảnh đại diện</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={styles.avatarPreview} style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', display: 'grid', placeItems: 'center' }}>
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 24, color: '#999' }}>?</span>
                    )}
                  </div>
                  <label className={styles.btnSecondary} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FiUpload /> {saving ? 'Đang tải...' : 'Chọn ảnh từ máy'}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={saving} />
                  </label>
                </div>
                <input 
                  style={{ marginTop: 8, fontSize: '12px', opacity: 0.7 }}
                  value={form.avatarUrl} 
                  onChange={e => setForm({ ...form, avatarUrl: e.target.value })} 
                  placeholder="Hoặc dán URL ảnh vào đây"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
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

export default AdminUsers;
