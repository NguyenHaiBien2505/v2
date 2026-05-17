// src/components/NotificationDialog.tsx
import { FC } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import styles from '../pages/admin/Admin.module.css';
import type { NotificationState } from '../hooks/useNotification';

interface NotificationDialogProps extends NotificationState {
  onClose: () => void;
}

const NotificationDialog: FC<NotificationDialogProps> = ({
  isOpen,
  title,
  message,
  type,
  confirmText = 'Đóng',
  cancelText = 'Hủy',
  isDangerous = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.iconSuccess} />;
      case 'error':
        return <FiAlertCircle className={styles.iconError} />;
      case 'warning':
        return <FiAlertTriangle className={styles.iconWarning} />;
      case 'info':
      default:
        return <FiInfo className={styles.iconInfo} />;
    }
  };

  const getHeaderStyle = () => {
    switch (type) {
      case 'success':
        return { borderBottom: '2px solid #10b981' };
      case 'error':
        return { borderBottom: '2px solid #ef4444' };
      case 'warning':
        return { borderBottom: '2px solid #f59e0b' };
      case 'info':
      default:
        return { borderBottom: '2px solid #3b82f6' };
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={getHeaderStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getIcon()}
            <h2>{title}</h2>
          </div>
          <button className={styles.modalClose} onClick={handleCancel}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          {type === 'confirm' ? (
            <>
              <button className={styles.btnSecondary} onClick={handleCancel}>
                {cancelText}
              </button>
              <button
                className={isDangerous ? `${styles.btnPrimary} ${styles.danger}` : styles.btnPrimary}
                style={isDangerous ? { background: '#ef4444' } : {}}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button className={styles.btnPrimary} onClick={handleConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;
