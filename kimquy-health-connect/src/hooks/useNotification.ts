// src/hooks/useNotification.ts
import { useState, useCallback } from 'react';

export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showSuccess = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      setNotification({
        isOpen: true,
        title,
        message,
        type: 'success',
        confirmText: 'Đóng',
        onConfirm: () => {
          closeNotification();
          onConfirm?.();
        },
      });
    },
    []
  );

  const showError = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      setNotification({
        isOpen: true,
        title,
        message,
        type: 'error',
        confirmText: 'Đóng',
        onConfirm: () => {
          closeNotification();
          onConfirm?.();
        },
      });
    },
    []
  );

  const showInfo = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      setNotification({
        isOpen: true,
        title,
        message,
        type: 'info',
        confirmText: 'Đóng',
        onConfirm: () => {
          closeNotification();
          onConfirm?.();
        },
      });
    },
    []
  );

  const showWarning = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      setNotification({
        isOpen: true,
        title,
        message,
        type: 'warning',
        confirmText: 'Đóng',
        onConfirm: () => {
          closeNotification();
          onConfirm?.();
        },
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      confirmText = 'Xác nhận',
      cancelText = 'Hủy',
      isDangerous = false
    ) => {
      setNotification({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        isDangerous,
        onConfirm: async () => {
          await onConfirm();
          closeNotification();
        },
        onCancel: closeNotification,
      });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    closeNotification,
  };
};
