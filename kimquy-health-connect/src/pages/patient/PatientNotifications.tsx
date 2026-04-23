import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { patientSidebar } from './PatientDashboard';
import type { Notification } from '../../data/mockData';
import { useAuthStore } from '../../store/authStore';
import { getPatientNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/healthApi';
import styles from './PatientDashboard.module.css';

const PatientNotifications = () => {
  const profile = useAuthStore((s) => s.profile) as { id?: string } | null;
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      const data = await getPatientNotifications(profile.id).catch(() => []);
      setNotifications(data);
    };

    load();
  }, [profile?.id]);

  const markRead = async (id: number) => {
    await markNotificationRead(id).catch(() => null);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    if (!profile?.id) return;
    await markAllNotificationsRead(profile.id).catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <DashboardLayout sections={patientSidebar}>
      <h1 className={styles.pageTitle}>Thông báo</h1>
      <div style={{ marginBottom: 12 }}>
        <button className={styles.btnAction} onClick={markAllRead}>Đánh dấu đã đọc tất cả</button>
      </div>
      <div className={styles.tableCard}>
        {notifications.map((n) => (
          <div key={n.id} style={{
            padding: '1rem', borderBottom: '1px solid var(--color-border-light)',
            background: n.isRead ? 'transparent' : 'var(--color-primary-bg)',
            borderRadius: 'var(--radius-sm)', marginBottom: 4,
          }} onClick={() => !n.isRead && markRead(n.id)}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{n.message}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PatientNotifications;
