import { useState, useMemo } from 'react';
import { FiSearch, FiActivity } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { auditLogs, refreshTokens } from '../../data/mockData';
import styles from './Admin.module.css';

const actionColor: Record<string, string> = {
  CREATE: '#10b981', UPDATE: '#3b82f6', DELETE: '#ef4444', LOGIN: '#8b5cf6', LOGOUT: '#64748b',
};

const AdminAuditLogs = () => {
  const [tab, setTab] = useState<'audit' | 'tokens'>('audit');
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [tokens, setTokens] = useState(refreshTokens);

  const filtered = useMemo(() => auditLogs.filter(l => {
    const matchSearch = !search ||
      l.userName?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity?.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'ALL' || l.action === filterAction;
    return matchSearch && matchAction;
  }), [search, filterAction]);

  const revoke = (id: number) => {
    if (!confirm('Thu hồi token này? Thiết bị sẽ phải đăng nhập lại.')) return;
    setTokens(tokens.map(t => t.id === id ? { ...t, revoked: true } : t));
  };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Nhật ký hệ thống</h1>
      <p className={styles.pageSubtitle}>Truy vết hành động & quản lý phiên đăng nhập</p>

      <div className={styles.toolbar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={tab === 'audit' ? styles.btnPrimary : styles.btnSecondary} onClick={() => setTab('audit')}>
            <FiActivity /> Audit Log ({auditLogs.length})
          </button>
          <button className={tab === 'tokens' ? styles.btnPrimary : styles.btnSecondary} onClick={() => setTab('tokens')}>
            Phiên đăng nhập ({tokens.filter(t => !t.revoked).length})
          </button>
        </div>
      </div>

      {tab === 'audit' && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo người dùng, entity, action..." />
            </div>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <option value="ALL">Tất cả hành động</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng</th><th>Thay đổi</th><th>IP</th></tr></thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                      <td><strong>{l.userName || 'Hệ thống'}</strong></td>
                      <td><span className={styles.statusBadge} style={{ background: `${actionColor[l.action] || '#64748b'}20`, color: actionColor[l.action] || '#64748b' }}>{l.action}</span></td>
                      <td>{l.entity ? `${l.entity}#${l.entityId}` : '—'}</td>
                      <td style={{ fontSize: 11, fontFamily: 'monospace', maxWidth: 280 }}>
                        {l.oldValue && <div style={{ color: '#ef4444' }}>− {JSON.stringify(l.oldValue)}</div>}
                        {l.newValue && <div style={{ color: '#10b981' }}>+ {JSON.stringify(l.newValue)}</div>}
                      </td>
                      <td style={{ fontSize: 12 }}>{l.ipAddress || '—'}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-light)' }}>Không có nhật ký</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'tokens' && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Người dùng</th><th>Thiết bị</th><th>Tạo lúc</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {tokens.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.userName}</strong></td>
                    <td style={{ fontSize: 12 }}>{t.deviceInfo}</td>
                    <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                    <td style={{ fontSize: 12 }}>{new Date(t.expiresAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${t.revoked ? styles.statusCancelled : styles.statusConfirmed}`}>
                        {t.revoked ? 'Đã thu hồi' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>
                      {!t.revoked && <button className={styles.btnSecondary} onClick={() => revoke(t.id)}>Thu hồi</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
