import { useState } from 'react';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { defaultSettings, type Setting, type SettingValueType } from '../../data/mockData';
import styles from './Admin.module.css';

const typeColor: Record<SettingValueType, string> = {
  STRING: '#3b82f6', NUMBER: '#10b981', BOOLEAN: '#f59e0b', JSON: '#8b5cf6',
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSetting, setNewSetting] = useState<Partial<Setting>>({ valueType: 'STRING' });

  const updateValue = (key: string, value: string) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value, updatedAt: new Date().toISOString().slice(0, 10) } : s));
  };

  const remove = (key: string) => {
    if (confirm(`Xóa setting "${key}"?`)) setSettings(settings.filter(s => s.key !== key));
  };

  const add = () => {
    if (!newSetting.key || !newSetting.value) return;
    setSettings([...settings, { ...newSetting, updatedAt: new Date().toISOString().slice(0, 10) } as Setting]);
    setNewSetting({ valueType: 'STRING' });
    setShowAdd(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Cấu hình hệ thống</h1>
      <p className={styles.pageSubtitle}>Key-value store · Có hiệu lực ngay không cần deploy lại</p>

      <div className={styles.toolbar}>
        <div style={{ flex: 1 }} />
        <button className={styles.btnPrimary} onClick={() => setShowAdd(true)}><FiPlus /> Thêm setting</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Key</th><th>Kiểu</th><th>Giá trị</th><th>Mô tả</th><th>Cập nhật</th><th>Thao tác</th></tr></thead>
            <tbody>
              {settings.map(s => (
                <tr key={s.key}>
                  <td><code style={{ background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{s.key}</code></td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: `${typeColor[s.valueType]}20`, color: typeColor[s.valueType] }}>{s.valueType}</span>
                  </td>
                  <td style={{ minWidth: 200 }}>
                    {s.valueType === 'BOOLEAN' ? (
                      <label>
                        <input type="checkbox" checked={s.value === 'true'} onChange={e => updateValue(s.key, String(e.target.checked))} style={{ marginRight: 6 }} />
                        {s.value === 'true' ? 'Bật' : 'Tắt'}
                      </label>
                    ) : (
                      <input
                        value={s.value}
                        onChange={e => updateValue(s.key, e.target.value)}
                        type={s.valueType === 'NUMBER' ? 'number' : 'text'}
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, fontFamily: s.valueType === 'JSON' ? 'monospace' : 'inherit' }}
                      />
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{s.description}</td>
                  <td style={{ fontSize: 12 }}>{s.updatedAt}</td>
                  <td>
                    <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => remove(s.key)}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <button className={styles.btnPrimary} onClick={handleSave}><FiSave /> Lưu tất cả</button>
        {saved && <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Đã lưu thành công</span>}
      </div>

      {showAdd && (
        <div className={styles.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Thêm setting mới</h2>
              <button className={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Key (snake_case) *</label>
                <input value={newSetting.key || ''} onChange={e => setNewSetting({ ...newSetting, key: e.target.value })} placeholder="vd: enable_chat_widget" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Kiểu</label>
                  <select value={newSetting.valueType} onChange={e => setNewSetting({ ...newSetting, valueType: e.target.value as SettingValueType })}>
                    <option value="STRING">STRING</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Giá trị *</label>
                  <input value={newSetting.value || ''} onChange={e => setNewSetting({ ...newSetting, value: e.target.value })} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <input value={newSetting.description || ''} onChange={e => setNewSetting({ ...newSetting, description: e.target.value })} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowAdd(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={add}>Tạo mới</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminSettings;
