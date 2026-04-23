import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { getAllSpecialties, getAdminDoctors, createAdminDoctor, updateAdminDoctor, deleteAdminDoctor, type AdminDoctorRow } from '../../services/healthApi';
import styles from './Admin.module.css';

type SpecialtyOption = { id: number; name: string };

interface DoctorForm {
  fullName: string;
  username: string;
  password: string;
  degree: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  clinicFee: number;
  licenseNumber: string;
  phone: string;
  specialtyId: number | '';
}

const AdminDoctors = () => {
  const [list, setList] = useState<AdminDoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminDoctorRow | null>(null);
  const [form, setForm] = useState<DoctorForm>({
    fullName: '',
    username: '',
    password: '',
    degree: '',
    avatarUrl: '',
    bio: '',
    experienceYears: 0,
    clinicFee: 0,
    licenseNumber: '',
    phone: '',
    specialtyId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [doctors, specialtyRows] = await Promise.all([getAdminDoctors(), getAllSpecialties()]);
      setList(doctors);
      setSpecialties(specialtyRows.map((s) => ({ id: s.id, name: s.name })));
    } catch {
      setError('Không tải được danh sách bác sĩ hoặc chuyên khoa từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => list.filter(d =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.username.toLowerCase().includes(search.toLowerCase()) ||
    d.specialtyName.toLowerCase().includes(search.toLowerCase())
  ), [list, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      fullName: '',
      username: '',
      password: '',
      degree: '',
      avatarUrl: '',
      bio: '',
      experienceYears: 0,
      clinicFee: 0,
      licenseNumber: '',
      phone: '',
      specialtyId: specialties[0]?.id ?? '',
    });
    setShowModal(true);
  };

  const openEdit = (d: AdminDoctorRow) => {
    setEditing(d);
    setForm({
      fullName: d.fullName,
      username: d.username,
      password: '',
      degree: d.degree,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      experienceYears: d.experienceYears,
      clinicFee: d.clinicFee,
      licenseNumber: d.licenseNumber,
      phone: d.phone,
      specialtyId: d.specialtyId,
    });
    setShowModal(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa bác sĩ này?')) return;
    try {
      await deleteAdminDoctor(id);
      await refresh();
    } catch {
      setError('Xóa bác sĩ thất bại.');
    }
  };

  const save = async () => {
    if (!form.fullName.trim()) return setError('Vui lòng nhập họ tên bác sĩ.');
    if (!editing && !form.username.trim()) return setError('Vui lòng nhập username.');
    if (!editing && !form.password.trim()) return setError('Vui lòng nhập mật khẩu.');
    if (!form.specialtyId) return setError('Vui lòng chọn chuyên khoa.');

    try {
      setSaving(true);
      setError('');
      if (editing) {
        await updateAdminDoctor(editing.id, {
          fullName: form.fullName,
          degree: form.degree,
          avatarUrl: form.avatarUrl || undefined,
          bio: form.bio,
          experienceYears: form.experienceYears,
          clinicFee: form.clinicFee,
          licenseNumber: form.licenseNumber,
          phone: form.phone,
          specialtyId: Number(form.specialtyId),
        });
      } else {
        await createAdminDoctor({
          fullName: form.fullName,
          username: form.username,
          password: form.password,
          degree: form.degree,
          avatarUrl: form.avatarUrl || undefined,
          bio: form.bio,
          experienceYears: form.experienceYears,
          clinicFee: form.clinicFee,
          licenseNumber: form.licenseNumber,
          phone: form.phone,
          specialtyId: Number(form.specialtyId),
        });
      }
      setShowModal(false);
      await refresh();
    } catch {
      setError('Không thể lưu bác sĩ. Hãy kiểm tra dữ liệu và quyền ADMIN.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Quản lý bác sĩ</h1>
      <p className={styles.pageSubtitle}>Tổng cộng {list.length} bác sĩ</p>
      {error && (
        <div style={{ marginBottom: 12, color: '#b42318', background: '#fef3f2', border: '1px solid #fecdca', padding: 10, borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bác sĩ, username, chuyên khoa..." />
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.btnPrimary} onClick={openAdd}><FiPlus /> Thêm bác sĩ</button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Bác sĩ</th><th>Username</th><th>Chuyên khoa</th><th>Số CCHN</th><th>Kinh nghiệm</th><th>Phí khám</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={7}>Đang tải dữ liệu...</td></tr>}
              {!loading && filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className={styles.avatarCell}>
                      <img src={d.avatarUrl || 'https://i.pravatar.cc/150?img=12'} alt={d.fullName} className={styles.avatar} />
                      <span>{d.fullName}</span>
                    </div>
                  </td>
                  <td>{d.username}</td>
                  <td>{d.specialtyName || <em style={{ color: 'var(--color-text-light)' }}>Chưa gán</em>}</td>
                  <td><code style={{ fontSize: 11 }}>{d.licenseNumber || <em style={{ color: '#ef4444' }}>Thiếu</em>}</code></td>
                  <td>{d.experienceYears} năm</td>
                  <td>{d.clinicFee.toLocaleString()}đ</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnIcon} onClick={() => openEdit(d)}><FiEdit2 /></button>
                      <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => remove(d.id)}><FiTrash2 /></button>
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
              <h2>{editing ? 'Sửa bác sĩ' : 'Thêm bác sĩ mới'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Họ tên đầy đủ *</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Username {editing ? '' : '*'}</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!editing} />
                </div>
                <div className={styles.formGroup}>
                  <label>{editing ? 'Mật khẩu mới' : 'Mật khẩu *'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Để trống nếu không đổi' : ''} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Chuyên khoa *</label>
                  <select value={form.specialtyId} onChange={e => setForm({ ...form, specialtyId: e.target.value ? +e.target.value : '' })}>
                    <option value="">— Chọn chuyên khoa —</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Số CCHN</label>
                  <input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="VD: CCHN-001234/HN" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Học vị</label>
                  <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Số năm kinh nghiệm</label>
                  <input type="number" value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: +e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phí khám (VNĐ)</label>
                  <input type="number" value={form.clinicFee} onChange={e => setForm({ ...form, clinicFee: +e.target.value })} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Avatar URL</label>
                <input value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Tiểu sử</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDoctors;
