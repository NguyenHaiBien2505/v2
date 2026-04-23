import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminSidebar } from './adminSidebar';
import { useEffect, useState } from 'react';
import { getNotificationLog, clearNotificationLog, type NotificationLog } from '../../services/notificationService';
import styles from './Admin.module.css';

const eventLabel: Record<string, string> = {
  APPOINTMENT_CONFIRMED: 'Lịch hẹn được xác nhận',
  APPOINTMENT_CANCELLED: 'Lịch hẹn bị hủy',
  APPOINTMENT_RESCHEDULED: 'Đổi lịch hẹn',
  MEDICAL_RECORD_READY: 'Kết quả khám sẵn sàng',
};

const AdminNotifications = () => {
  const [log, setLog] = useState<NotificationLog[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => { setLog(getNotificationLog()); }, [tick]);

  const handleClear = () => { clearNotificationLog(); setTick(t => t + 1); };

  return (
    <DashboardLayout sections={adminSidebar}>
      <h1 className={styles.pageTitle}>Lịch sử thông báo Email/SMS</h1>
      <p className={styles.pageSubtitle}>Tổng cộng {log.length} thông báo đã gửi (mock)</p>

      <div className={styles.toolbar}>
        <button className={styles.btnSecondary} onClick={() => setTick(t => t + 1)}>Làm mới</button>
        <button className={styles.btnSecondary} onClick={handleClear}>Xóa lịch sử</button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Thời gian</th><th>Kênh</th><th>Sự kiện</th><th>Người nhận</th><th>Tiêu đề</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {log.map(n => (
                <tr key={n.id}>
                  <td>{new Date(n.sentAt).toLocaleString('vi-VN')}</td>
                  <td><strong>{n.channel === 'EMAIL' ? '📧 Email' : '📱 SMS'}</strong></td>
                  <td>{eventLabel[n.event] || n.event}</td>
                  <td>{n.to}</td>
                  <td>{n.subject}</td>
                  <td><span className={`${styles.statusBadge} ${styles.statusCompleted}`}>{n.status}</span></td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Chưa có thông báo nào. Hãy duyệt/hủy một lịch hẹn để gửi thông báo thử.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
