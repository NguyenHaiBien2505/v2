// MIGRATION GUIDE: Updating Pages to Use Vietnamese Notification System

/**
 * This guide shows how to migrate existing pages that use alert() 
 * to the new notification system with Vietnamese messages.
 */

// ============================================================================
// STEP 1: Import the necessary dependencies
// ============================================================================

// BEFORE:
// import { ... } from '...';

// AFTER - Add these imports:
import { useNotification } from '../../hooks/useNotification';
import NotificationDialog from '../../components/NotificationDialog';


// ============================================================================
// STEP 2: Initialize the notification hook in your component
// ============================================================================

// BEFORE:
// const MyComponent = () => {
//   // ... existing state

// AFTER:
const MyComponent = () => {
  const { notification, showSuccess, showError, showInfo, showWarning, showConfirm, closeNotification } = useNotification();
  // ... existing state


// ============================================================================
// STEP 3: Replace alert() calls with notification methods
// ============================================================================

// BEFORE:
// alert('Lưu thành công');
// try {
//   await apiCall();
// } catch (e) {
//   alert('Lỗi khi lưu');
// }

// AFTER:
// showSuccess('Thành công', 'Lưu thành công');
// try {
//   await apiCall();
// } catch (error) {
//   showError('Lỗi khi lưu', error);
// }


// ============================================================================
// STEP 4: Replace window.confirm() with showConfirm()
// ============================================================================

// BEFORE:
// if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
//   await deleteItem();
// }

// AFTER:
// showConfirm(
//   'Xác nhận xóa',
//   'Bạn có chắc chắn muốn xóa mục này không?',
//   async () => {
//     try {
//       await deleteItem();
//       showSuccess('Thành công', 'Mục đã được xóa');
//     } catch (error) {
//       showError('Lỗi', error);
//     }
//   },
//   'Xóa',   // confirmText
//   'Hủy',   // cancelText
//   true     // isDangerous (optional - red background)
// );


// ============================================================================
// STEP 5: Add the NotificationDialog component to render
// ============================================================================

// BEFORE:
// return (
//   <DashboardLayout>
//     {/* page content */}
//   </DashboardLayout>
// );

// AFTER:
// return (
//   <DashboardLayout>
//     {/* page content */}
//     <NotificationDialog {...notification} onClose={closeNotification} />
//   </DashboardLayout>
// );


// ============================================================================
// COMPLETE EXAMPLE - Before and After
// ============================================================================

// ============================================================================
// BEFORE:
// ============================================================================
/*
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAppointments, cancelAppointment } from '../../services/healthApi';

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        alert('Không thể tải cuộc hẹn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này?')) {
      try {
        await cancelAppointment(id);
        alert('Cuộc hẹn đã được hủy');
        setAppointments(appointments.filter(a => a.id !== id));
      } catch (error) {
        alert('Không thể hủy cuộc hẹn. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <DashboardLayout>
      {loading ? <p>Đang tải...</p> : (
        <div>
          {appointments.map(appt => (
            <div key={appt.id}>
              <p>{appt.reason}</p>
              <button onClick={() => handleCancel(appt.id)}>Hủy</button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
*/

// ============================================================================
// AFTER:
// ============================================================================
/*
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import NotificationDialog from '../../components/NotificationDialog';
import { getAppointments, cancelAppointment } from '../../services/healthApi';
import { useNotification } from '../../hooks/useNotification';

const AppointmentPage = () => {
  const { notification, showSuccess, showError, showConfirm, closeNotification } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        showError('Lỗi', 'Không thể tải cuộc hẹn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  const handleCancel = (id) => {
    showConfirm(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy cuộc hẹn này?',
      async () => {
        try {
          await cancelAppointment(id);
          showSuccess('Thành công', 'Cuộc hẹn đã được hủy');
          setAppointments(appointments.filter(a => a.id !== id));
        } catch (error) {
          showError('Lỗi', error);
        }
      },
      'Hủy',
      'Giữ lại',
      true
    );
  };

  return (
    <DashboardLayout>
      {loading ? <p>Đang tải...</p> : (
        <div>
          {appointments.map(appt => (
            <div key={appt.id}>
              <p>{appt.reason}</p>
              <button onClick={() => handleCancel(appt.id)}>Hủy</button>
            </div>
          ))}
        </div>
      )}
      <NotificationDialog {...notification} onClose={closeNotification} />
    </DashboardLayout>
  );
};
*/


// ============================================================================
// TIPS FOR MIGRATION
// ============================================================================

/*
1. Error messages are AUTOMATICALLY translated:
   - Backend errors with codes will be translated to Vietnamese
   - Just pass the error object: showError('Lỗi', error)
   - The translation happens automatically

2. Use showConfirm() instead of window.confirm():
   - Provides better UI/UX
   - Can be styled per notification type
   - Supports both confirm and cancel callbacks

3. Notification types and their uses:
   - showSuccess(): After successful operations
   - showError(): When something goes wrong
   - showWarning(): For warnings that need attention
   - showInfo(): For informational messages
   - showConfirm(): For confirmation dialogs

4. Dangerous actions (like delete):
   - Use showConfirm() with isDangerous=true
   - Shows red background to emphasize the action

5. Add useEffect dependencies:
   - Include notification methods in dependency arrays where needed
   - This ensures proper cleanup and re-renders

6. Error handling:
   - The system automatically maps error codes to Vietnamese messages
   - If error has .message property, it will be used as fallback
   - No need to manually map error codes

7. Integration with existing pages:
   - Update one page at a time
   - Test thoroughly after each migration
   - Keep alert() and window.confirm() as fallback only
*/

export default MyComponent;
