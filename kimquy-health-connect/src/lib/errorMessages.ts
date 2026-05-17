// src/lib/errorMessages.ts
/**
 * Vietnamese error message translations and mapping
 */

export const ERROR_MESSAGES: Record<number, string> = {
  // General errors
  9999: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  1001: 'Khóa thông báo không hợp lệ',

  // User errors
  1002: 'Người dùng đã tồn tại',
  1003: 'Người dùng không tồn tại',
  1004: 'Tên đăng nhập phải có ít nhất 3 ký tự',
  1005: 'Mật khẩu phải có ít nhất 8 ký tự',
  1006: 'Bạn phải ít nhất 18 tuổi',

  // Role errors
  2001: 'Vai trò không tồn tại',

  // Authentication errors
  3001: 'Chưa xác thực. Vui lòng đăng nhập.',
  3002: 'Bạn không có quyền thực hiện hành động này',

  // Entity errors
  4001: 'Bác sĩ không tồn tại',
  4002: 'Bệnh nhân không tồn tại',
  4003: 'Chuyên khoa không tồn tại',
  4004: 'Cuộc hẹn không tồn tại',
  4005: 'Lịch khám không tồn tại',
  4006: 'Hồ sơ y tế không tồn tại',
  4007: 'Đơn thuốc không tồn tại',
  4008: 'Banner không tồn tại',
  4009: 'Tin tức không tồn tại',
  4010: 'Dịch vụ không tồn tại',

  // Validation errors
  5001: 'Định dạng email không hợp lệ',
  5002: 'Số điện thoại không hợp lệ',
  5003: 'Thời gian hẹn xung đột với lịch khác',
  5004: 'Lịch khám đã đầy',
  5005: 'Yêu cầu không hợp lệ',

  // Database errors
  6001: 'Lỗi toàn vẹn dữ liệu',
};

/**
 * Get Vietnamese error message by error code
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    // Check if it's an API error with code
    if ('code' in error && typeof (error as any).code === 'number') {
      const code = (error as any).code;
      return ERROR_MESSAGES[code] || ERROR_MESSAGES[9999];
    }

    // Check if it's an API error with message
    if ('message' in error && typeof (error as any).message === 'string') {
      const message = (error as any).message.trim();
      if (message) {
        // Try to find error code in message
        const codeMatch = message.match(/\d+/);
        if (codeMatch) {
          const code = parseInt(codeMatch[0], 10);
          if (code in ERROR_MESSAGES) {
            return ERROR_MESSAGES[code];
          }
        }
        return message;
      }
    }

    // Check if it's an axios error
    if ('response' in error) {
      const responseData = (error as any).response?.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        return responseData.message;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return ERROR_MESSAGES[9999];
};

/**
 * Standard notification message types
 */
export const NOTIFICATION_MESSAGES = {
  SUCCESS: {
    CREATE: 'Thêm mới thành công',
    UPDATE: 'Cập nhật thành công',
    DELETE: 'Xóa thành công',
    SAVE: 'Lưu thành công',
    SEND: 'Gửi thành công',
    COMPLETE: 'Hoàn thành thành công',
  },
  ERROR: {
    LOAD_FAILED: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
    SAVE_FAILED: 'Không thể lưu. Vui lòng thử lại sau.',
    DELETE_FAILED: 'Không thể xóa. Vui lòng thử lại sau.',
    NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.',
  },
  INFO: {
    LOADING: 'Đang tải...',
    PROCESSING: 'Đang xử lý...',
  },
} as const;
