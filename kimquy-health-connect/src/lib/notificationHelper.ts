// src/lib/notificationHelper.ts
/**
 * Helper functions to show notifications with Vietnamese messages
 * This integrates the error messages with the notification system
 */

import { getErrorMessage, NOTIFICATION_MESSAGES } from './errorMessages';

export interface NotificationHelper {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, error?: unknown) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      isDangerous?: boolean;
    }
  ) => void;
}

/**
 * Create a notification helper bound to specific notification functions
 * Usage in a component:
 *   const { showError, showSuccess } = useNotification();
 *   const helper = createNotificationHelper(showError, showSuccess, ...);
 *   helper.showError('Lỗi', error);
 */
export const createNotificationHelper = (
  showErrorFn: (title: string, message: string, onConfirm?: () => void) => void,
  showSuccessFn: (title: string, message: string, onConfirm?: () => void) => void,
  showInfoFn: (title: string, message: string, onConfirm?: () => void) => void,
  showWarningFn: (title: string, message: string, onConfirm?: () => void) => void,
  showConfirmFn: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmText?: string,
    cancelText?: string,
    isDangerous?: boolean
  ) => void
): NotificationHelper => {
  return {
    showSuccess: (title: string, message?: string) => {
      showSuccessFn(title, message || NOTIFICATION_MESSAGES.SUCCESS.SAVE);
    },
    showError: (title: string, error?: unknown) => {
      const message = error ? getErrorMessage(error) : NOTIFICATION_MESSAGES.ERROR.SAVE_FAILED;
      showErrorFn(title, message);
    },
    showInfo: (title: string, message?: string) => {
      showInfoFn(title, message || NOTIFICATION_MESSAGES.INFO.LOADING);
    },
    showWarning: (title: string, message?: string) => {
      showWarningFn(title, message || 'Cảnh báo');
    },
    showConfirm: (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: {
        confirmText?: string;
        cancelText?: string;
        isDangerous?: boolean;
      }
    ) => {
      showConfirmFn(
        title,
        message,
        onConfirm,
        options?.confirmText || 'Xác nhận',
        options?.cancelText || 'Hủy',
        options?.isDangerous || false
      );
    },
  };
};
