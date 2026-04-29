import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../services/axiosInstance';
import MessageBubble from '../../components/chat/MessageBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';
import styles from './ChatbotPage.module.css';

type MessageRole = 'user' | 'bot';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
}




const quickPrompts = [
  '🤒 Tôi bị đau đầu, nên khám chuyên khoa nào?',
  '📅 Đặt lịch khám bác sĩ Nguyễn Văn A',
  '📋 Cho tôi xem lịch hẹn của tôi',
  '🏥 Giờ làm việc và địa chỉ bệnh viện?',
  '💰 Bảng giá khám bệnh',
  '👨‍⚕️ Gợi ý bác sĩ tim mạch',
];

const getNow = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const generateConversationId = () => {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `conv_${Date.now()}`;
};

const resolveTextResponse = (payload: unknown): string => {
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.result === 'string') return obj.result;
    if (typeof obj.message === 'string' && obj.message !== 'Success') return obj.message;
  }
  return 'Không nhận được nội dung phản hồi hợp lệ.';
};

const resolveChatErrorMessage = (error: unknown): string => {
  const fallback = 'Xin lỗi, hệ thống AI đang bận. Bạn vui lòng thử lại sau ít phút.';
  if (!(error instanceof Error)) return fallback;
  const text = error.message.toLowerCase();
  if (text.includes('failed to fetch') || text.includes('network'))
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.';
  if (text.includes('http 401') || text.includes('http 403'))
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (text.includes('http 429'))
    return 'Chatbot đang quá tải. Vui lòng thử lại sau vài giây.';
  if (text.includes('http 5'))
    return 'Máy chủ AI đang gặp sự cố tạm thời. Vui lòng thử lại sau.';
  return fallback;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ChatbotPage = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [conversationId] = useState<string>(() => generateConversationId());
  const [status, setStatus] = useState('Sẵn sàng');
  const [isBusy, setIsBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Resolve userId: prefer user.id (string UUID from auth), fallback to profile.userId
  const activeUserId: string | null = user?.id ?? profile?.userId ?? null;


  useEffect(() => {
    const greeting = user?.username
      ? `Xin chào **${user.username}**! 👋 Tôi là **KimQuy AI**, trợ lý sức khỏe thông minh của Bệnh viện Kim Quy.\n\nTôi có thể giúp bạn:\n• 🩺 **Tư vấn sức khỏe** — mô tả triệu chứng để được gợi ý chuyên khoa\n• 📅 **Đặt lịch khám** — với bác sĩ phù hợp\n• 🗓️ **Xem lịch hẹn** — lịch hẹn đang chờ của bạn\n• 🏥 **Thông tin bệnh viện** — giờ làm việc, địa chỉ, giá cả\n• 📷 **Phân tích hình ảnh** — gửi ảnh đơn thuốc hoặc triệu chứng\n\nBạn cần hỗ trợ gì hôm nay?`
      : `Xin chào! 👋 Tôi là **KimQuy AI**, trợ lý sức khỏe thông minh của Bệnh viện Kim Quy.\n\nTôi có thể giúp bạn:\n• 🩺 **Tư vấn sức khỏe** — mô tả triệu chứng để được gợi ý\n• 📅 **Đặt lịch khám** — cần đăng nhập để đặt lịch\n• 🏥 **Thông tin bệnh viện** — giờ làm việc, địa chỉ, giá cả\n• 📷 **Phân tích hình ảnh** — gửi ảnh đơn thuốc hoặc triệu chứng\n\nBạn cần hỗ trợ gì hôm nay?`;

    setMessages([
      { id: crypto.randomUUID(), role: 'bot', text: greeting, time: getNow() },
    ]);
  }, [user?.username]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isBusy]);

  const addMessage = (role: MessageRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, time: getNow() },
    ]);
  };

  const sendTextMessage = async (text: string): Promise<string> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await axiosInstance.post<unknown>('/chat/v2', {
          message: text,
          userId: activeUserId ?? undefined,
          conversationId: conversationId || null,
        });
        return resolveTextResponse(response.data);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Lỗi không xác định');
        lastError = err;
        const isLastAttempt = attempt === 1;
        const shouldRetry = err.message.includes('HTTP 5') || err.message.includes('Network Error');
        if (isLastAttempt || !shouldRetry) break;
        await wait(500);
      }
    }

    throw (lastError ?? new Error('Không thể gửi tin nhắn'));
  };

  const sendImageMessage = async (text: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', text || 'Vui lòng phân tích hình ảnh này cho tôi');
    if (conversationId) formData.append('conversationId', conversationId);
    if (activeUserId) formData.append('userId', activeUserId);

    const response = await axiosInstance.post<unknown>('/chat/with-image/v2', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resolveTextResponse(response.data);
  };

  const handleSendText = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isBusy) return;

    addMessage('user', trimmed);
    setMessage('');
    setIsBusy(true);
    setStatus('KimQuy AI đang trả lời...');

    try {
      const reply = await sendTextMessage(trimmed);
      addMessage('bot', reply);
      setStatus('Sẵn sàng');
    } catch (error) {
      addMessage('bot', resolveChatErrorMessage(error));
      setStatus('Đã xảy ra lỗi — thử lại');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendImage = async () => {
    if (!selectedFile || isBusy) {
      addMessage('bot', '⚠️ Vui lòng chọn ảnh trước khi gửi.');
      return;
    }

    const trimmed = message.trim();
    addMessage('user', `${trimmed || 'Phân tích hình ảnh'} 📎 [${selectedFile.name}]`);
    setMessage('');
    setIsBusy(true);
    setStatus('Đang tải ảnh và phân tích...');

    try {
      const reply = await sendImageMessage(trimmed, selectedFile);
      addMessage('bot', reply);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatus('Sẵn sàng');
    } catch (error) {
      addMessage('bot', resolveChatErrorMessage(error));
      setStatus('Đã xảy ra lỗi — thử lại');
    } finally {
      setIsBusy(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendText(event as unknown as FormEvent);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    const clean = prompt.replace(/^[^\w\u00C0-\u1EF9]+/, '').trim();
    setMessage(clean);
    textareaRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'bot',
        text: '🔄 Đã xóa lịch sử trò chuyện. Bạn có thể bắt đầu cuộc hội thoại mới!',
        time: getNow(),
      },
    ]);
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Decorative blobs */}
      <div className={styles.backgroundNoise} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbOne}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbTwo}`} aria-hidden="true" />

      <main className={styles.content}>
        <section className={styles.shell}>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className={`${styles.panel} ${styles.panelConfig}`}>
            <div className={styles.aiAvatar} aria-hidden="true">
              <span>🤖</span>
            </div>
            <h1 className={styles.title}>KimQuy AI</h1>
            <p className={styles.subtitle}>Trợ lý sức khỏe thông minh — tư vấn, đặt lịch và giải đáp thắc mắc y tế.</p>

            {user && (
              <div className={styles.userCard}>
                <span className={styles.userIcon}>👤</span>
                <span className={styles.userName}>Xin chào, <strong>{user.username}</strong></span>
              </div>
            )}

            <div className={styles.infoCard}>
              <p className={styles.infoHeading}>💡 Tôi có thể giúp gì?</p>
              <ul className={styles.infoList}>
                <li>🩺 Tư vấn triệu chứng & chuyên khoa</li>
                <li>📅 Đặt & xem lịch hẹn</li>
                <li>🏥 Thông tin bệnh viện & giá dịch vụ</li>
                <li>📷 Phân tích hình ảnh y tế</li>
              </ul>
            </div>

            <h3 className={styles.quickTitle}>⚡ Câu hỏi nhanh</h3>
            <div className={styles.chips}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className={styles.chip}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isBusy}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className={styles.disclaimer}>
              <p>⚠️ AI chỉ tư vấn tham khảo, không thay thế chẩn đoán y khoa. Trường hợp cấp cứu: gọi <strong>115</strong>.</p>
            </div>
          </aside>

          {/* ── Chat Panel ─────────────────────────────────────── */}
          <section className={`${styles.panel} ${styles.panelChat}`}>
            <header className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.statusDot} aria-hidden="true" />
                <div>
                  <h2 className={styles.chatTitle}>Trò chuyện với KimQuy AI</h2>
                  <p className={styles.status}>{status}</p>
                </div>
              </div>
              <div className={styles.chatHeaderRight}>
                <span className={styles.onlineBadge}>● Trực tuyến</span>
                <button
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={handleClearChat}
                  type="button"
                  disabled={isBusy}
                  title="Xóa lịch sử trò chuyện"
                >
                  🗑️ Xóa
                </button>
              </div>
            </header>

            <div ref={chatBodyRef} className={styles.chatBody} aria-live="polite" aria-label="Nội dung trò chuyện">
              {messages.map((chatMessage) => (
                <MessageBubble
                  key={chatMessage.id}
                  role={chatMessage.role}
                  text={chatMessage.text}
                  time={chatMessage.time}
                />
              ))}
              {isBusy && <TypingIndicator />}
            </div>

            <form className={styles.chatComposer} onSubmit={handleSendText}>
              {selectedFile && (
                <div className={styles.filePreview}>
                  <span>📎 {selectedFile.name}</span>
                  <button
                    type="button"
                    className={styles.fileRemove}
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className={styles.composerRow}>
                <label className={styles.uploadBox} htmlFor="chat-image-upload" title="Đính kèm hình ảnh">
                  <input
                    id="chat-image-upload"
                    ref={fileInputRef}
                    className={styles.uploadInput}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                  <span>📷</span>
                </label>

                <textarea
                  ref={textareaRef}
                  className={styles.inputMessage}
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Nhập câu hỏi sức khỏe... (Enter để gửi, Shift+Enter xuống dòng)"
                  disabled={isBusy}
                  aria-label="Nhập tin nhắn"
                />

                <div className={styles.composerActions}>
                  {selectedFile ? (
                    <button
                      className={`${styles.btn} ${styles.btnAccent}`}
                      type="button"
                      disabled={isBusy}
                      onClick={handleSendImage}
                      title="Gửi kèm ảnh"
                    >
                      📤 Gửi ảnh
                    </button>
                  ) : (
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      type="submit"
                      disabled={isBusy || !message.trim()}
                      title="Gửi tin nhắn"
                    >
                      ➤ Gửi
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ChatbotPage;
