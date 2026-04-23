/* ═══════════════════════════════════════
   Notification Service – Giả lập gửi Email/SMS
   (UI mock; lưu lịch sử vào localStorage)
   ═══════════════════════════════════════ */
import { toast } from 'sonner';

export type NotifyChannel = 'EMAIL' | 'SMS';
export type NotifyEvent =
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'MEDICAL_RECORD_READY';

export interface NotificationLog {
  id: string;
  channel: NotifyChannel;
  event: NotifyEvent;
  to: string; // email hoặc sđt
  subject: string;
  body: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

const STORAGE_KEY = 'kimquy.notifications.log';

const readLog = (): NotificationLog[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const writeLog = (l: NotificationLog[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(l.slice(0, 200)));

export const getNotificationLog = (): NotificationLog[] => readLog();
export const clearNotificationLog = () => writeLog([]);

const templates: Record<NotifyEvent, { subject: string; body: (ctx: Record<string, string>) => string }> = {
  APPOINTMENT_CONFIRMED: {
    subject: '[Kim Quy] Lịch hẹn đã được xác nhận',
    body: (c) => `Xin chào ${c.patientName},\n\nLịch hẹn khám với BS. ${c.doctorName} vào ${c.date} lúc ${c.time} đã được xác nhận.\n\nVui lòng đến trước 15 phút. Trân trọng,\nPhòng khám Kim Quy.`,
  },
  APPOINTMENT_CANCELLED: {
    subject: '[Kim Quy] Lịch hẹn đã bị hủy',
    body: (c) => `Xin chào ${c.patientName},\n\nLịch hẹn ngày ${c.date} lúc ${c.time} với BS. ${c.doctorName} đã bị hủy.\nLý do: ${c.reason || 'Không có'}.\n\nVui lòng đặt lịch lại nếu cần. Trân trọng,\nPhòng khám Kim Quy.`,
  },
  APPOINTMENT_RESCHEDULED: {
    subject: '[Kim Quy] Yêu cầu đổi lịch hẹn',
    body: (c) => `Xin chào ${c.patientName},\n\nYêu cầu đổi lịch sang ${c.date} lúc ${c.time} đã được ghi nhận và đang chờ xác nhận.\n\nTrân trọng,\nPhòng khám Kim Quy.`,
  },
  MEDICAL_RECORD_READY: {
    subject: '[Kim Quy] Kết quả khám đã sẵn sàng',
    body: (c) => `Xin chào ${c.patientName},\n\nBS. ${c.doctorName} đã hoàn tất kết quả khám ngày ${c.date}.\nChẩn đoán: ${c.diagnosis}.\n\nVui lòng đăng nhập để xem chi tiết & tải đơn thuốc PDF.\nTrân trọng,\nPhòng khám Kim Quy.`,
  },
};

interface SendInput {
  event: NotifyEvent;
  channels: NotifyChannel[];
  email?: string;
  phone?: string;
  context: Record<string, string>;
  silent?: boolean;
}

export const sendNotification = async ({ event, channels, email, phone, context, silent }: SendInput) => {
  const tpl = templates[event];
  const log = readLog();
  const created: NotificationLog[] = [];

  for (const ch of channels) {
    const to = ch === 'EMAIL' ? email : phone;
    if (!to) continue;
    // Giả lập độ trễ
    await new Promise(r => setTimeout(r, 250));
    const entry: NotificationLog = {
      id: crypto.randomUUID(),
      channel: ch,
      event,
      to,
      subject: tpl.subject,
      body: tpl.body(context),
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };
    created.push(entry);
  }

  writeLog([...created, ...log]);

  if (!silent && created.length) {
    const labels = created.map(c => c.channel === 'EMAIL' ? `📧 ${c.to}` : `📱 ${c.to}`).join(' • ');
    toast.success('Đã gửi thông báo', { description: labels });
  }

  return created;
};
