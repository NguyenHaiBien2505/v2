// HƯỚNG DẪN SỬ DỤNG HỆ THỐNG THÔNG BÁO VỚI TIẾNG VIỆT
// A/Usage Guide: Notification System with Vietnamese Messages

/**
 * STEP 1: Import the necessary hooks and components in your component
 */
import { useNotification } from '../../hooks/useNotification';
import NotificationDialog from '../../components/NotificationDialog';
import { createNotificationHelper } from '../../lib/notificationHelper';

/**
 * STEP 2: In your component, initialize the notification system
 */
const MyComponent = () => {
  const {
    notification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    closeNotification,
  } = useNotification();

  // Optional: Create a helper for cleaner code
  const notify = createNotificationHelper(
    showError,
    showSuccess,
    showInfo,
    showWarning,
    showConfirm
  );

  /**
   * STEP 3: Use the notification system in your handlers
   */

  // Example 1: Show error when API call fails
  const handleSave = async () => {
    try {
      await apiCall();
      showSuccess('Thành công', 'Dữ liệu đã được lưu');
      // or using helper:
      // notify.showSuccess('Thành công', 'Dữ liệu đã được lưu');
    } catch (error) {
      showError('Lỗi', error);
      // or using helper:
      // notify.showError('Lỗi', error);
    }
  };

  // Example 2: Show confirmation dialog
  const handleDelete = async () => {
    showConfirm(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa mục này không?',
      async () => {
        try {
          await deleteItem();
          showSuccess('Thành công', 'Mục đã được xóa');
        } catch (error) {
          showError('Lỗi', error);
        }
      },
      'Xóa',      // confirmText
      'Hủy',      // cancelText
      true        // isDangerous - sets red background
    );
  };

  // Example 3: Show info message
  const handleInfo = () => {
    showInfo('Thông tin', 'Đây là một thông báo thông tin');
  };

  // Example 4: Show warning
  const handleWarning = () => {
    showWarning('Cảnh báo', 'Cảnh báo: Hành động này không thể hoàn tác');
  };

  /**
   * STEP 4: Render the NotificationDialog component
   */
  return (
    <div>
      {/* Your component content */}
      <button onClick={handleSave}>Lưu</button>
      <button onClick={handleDelete}>Xóa</button>
      <button onClick={handleInfo}>Thông tin</button>
      <button onClick={handleWarning}>Cảnh báo</button>

      {/* Add the notification dialog */}
      <NotificationDialog
        {...notification}
        onClose={closeNotification}
      />
    </div>
  );
};

/**
 * NOTIFICATION TYPES:
 * - 'success': Green icon, border color #10b981
 * - 'error':   Red icon, border color #ef4444
 * - 'info':    Blue icon, border color #3b82f6
 * - 'warning': Orange icon, border color #f59e0b
 * - 'confirm': Shows both confirm and cancel buttons
 */

/**
 * ERROR MESSAGES ARE AUTOMATICALLY TRANSLATED:
 * Backend error codes like:
 *   4005 -> "Lịch khám không tồn tại"
 *   1003 -> "Người dùng không tồn tại"
 *   5003 -> "Thời gian hẹn xung đột với lịch khác"
 * 
 * See src/lib/errorMessages.ts for the full mapping
 */

/**
 * EXAMPLE: Real-world usage
 */

// BEFORE (without notification system):
// try {
//   await createDoctorSchedule(profile.id, payload);
//   alert('Lưu lịch xong (đã gửi lên server).');
// } catch (e) {
//   alert('Lỗi khi lưu lịch');
// }

// AFTER (with notification system):
// try {
//   await createDoctorSchedule(profile.id, payload);
//   showSuccess('Thành công', 'Lưu lịch xong (đã gửi lên server).');
// } catch (error) {
//   showError('Lỗi khi lưu lịch', error);  // Error message automatically translated
// }

export default MyComponent;
