import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FiMaximize2, FiMessageCircle, FiMinimize2, FiSend, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from './MessageBubble';
import styles from './FloatingChatbot.module.css';

type MessageRole = 'user' | 'bot';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
}

const quickPrompts = [
  '🤒 Đau đầu khám khoa nào?',
  '📅 Đặt lịch khám bác sĩ',
  '🏥 Giờ làm việc',
  '💰 Bảng giá khám bệnh',
];

const getNow = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const generateConversationId = () => {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `conv_${Date.now()}`;
};

const createMessage = (role: MessageRole, text: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  text,
  time: getNow(),
});

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
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.';
  }
  if (text.includes('http 401') || text.includes('http 403')) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (text.includes('http 429')) {
    return 'Chatbot đang quá tải. Vui lòng thử lại sau vài giây.';
  }
  if (text.includes('http 5')) {
    return 'Máy chủ AI đang gặp sự cố tạm thời. Vui lòng thử lại sau.';
  }
  return fallback;
};

const FloatingChatbot = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId] = useState<string>(() => generateConversationId());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUserId: string | null = user?.id ?? profile?.userId ?? null;

  const shouldHideWidget = false; // Never hide it anymore because it REPLACES the page

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) return;
    const hello = user?.username
      ? `Xin chào ${user.username}! Mình là KimQuy AI. Bạn cần hỗ trợ thông tin bệnh viện, triệu chứng hay đặt lịch khám?`
      : 'Xin chào! Mình là KimQuy AI. Bạn cần hỗ trợ thông tin bệnh viện, triệu chứng hay đặt lịch khám?';
    setMessages([createMessage('bot', hello)]);
  }, [messages.length, user?.username]);

  useEffect(() => {
    setIsOpen(false);
    setIsExpanded(false);
  }, [location.pathname]);

  const addMessage = (role: MessageRole, text: string) => {
    setMessages((prev) => [...prev, createMessage(role, text)]);
  };

  const handleClearChat = () => {
    setMessages([createMessage('bot', '🔄 Đã xóa lịch sử trò chuyện. Bạn có thể bắt đầu cuộc hội thoại mới!')]);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setIsOpen(true);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && !selectedFile) || isTyping) return;

    if (selectedFile) {
      addMessage('user', `${trimmed || 'Phân tích hình ảnh'} 📎 [${selectedFile.name}]`);
      setMessage('');
      setIsTyping(true);

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('message', trimmed || 'Vui lòng phân tích hình ảnh này cho tôi');
        if (conversationId) formData.append('conversationId', conversationId);
        if (activeUserId) formData.append('userId', activeUserId);

        const response = await axiosInstance.post<unknown>('/chat/with-image/v2', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const reply = resolveTextResponse(response.data);
        addMessage('bot', reply);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      } catch (error) {
        addMessage('bot', resolveChatErrorMessage(error));
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    addMessage('user', trimmed);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await axiosInstance.post<unknown>('/chat/v2', {
        message: trimmed,
        userId: activeUserId ?? undefined,
        conversationId,
      });
      const reply = resolveTextResponse(response.data);
      addMessage('bot', reply);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      const fallback = resolveChatErrorMessage(error);
      addMessage('bot', fallback);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (shouldHideWidget) return null;

  return (
    <div className={styles.wrap}>
      <section
        className={`${styles.chatWindow} ${isOpen ? styles.open : ''} ${isExpanded ? styles.expanded : ''}`}
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.dot} aria-hidden="true" />
            <div>
              <h3>Chat với AI</h3>
              <p>Hỗ trợ trực tuyến</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.iconBtn} onClick={handleClearChat} title="Xóa lịch sử">
              🗑️
            </button>
            {!isExpanded && (
              <button type="button" className={styles.iconBtn} onClick={handleExpand} title="Phóng to">
                <FiMaximize2 />
              </button>
            )}
            {isExpanded && (
              <button type="button" className={styles.iconBtn} onClick={handleMinimize} title="Thu nhỏ">
                <FiMinimize2 />
              </button>
            )}
            <button type="button" className={styles.iconBtn} onClick={handleClose} title="Đóng">
              <FiX />
            </button>
          </div>
        </header>

        <div className={styles.body} ref={chatBodyRef}>
          {messages.map((item) => (
            <MessageBubble key={item.id} role={item.role} text={item.text} time={item.time} />
          ))}

          {isTyping && (
            <div className={styles.typing} aria-label="Bot đang nhập..." role="status">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {isExpanded && messages.length < 3 && (
          <div className={styles.quickPrompts}>
            {quickPrompts.map(p => (
              <button key={p} className={styles.quickBtn} onClick={() => handleQuickPrompt(p)} type="button">
                {p}
              </button>
            ))}
          </div>
        )}

        {selectedFile && (
          <div className={styles.filePreview}>
            <span>📎 {selectedFile.name}</span>
            <button type="button" onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}>✕</button>
          </div>
        )}

        <form className={styles.composer} onSubmit={handleSend}>
          <label className={styles.uploadBtn} title="Gửi ảnh">
            📷
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} 
              style={{ display: 'none' }} 
            />
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            aria-label="Nhập tin nhắn"
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || (!message.trim() && !selectedFile)} title="Gửi">
            <FiSend />
          </button>
        </form>
      </section>

      <button
        type="button"
        className={styles.launcher}
        onClick={handleToggleOpen}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        <FiMessageCircle />
        {unreadCount > 0 && !isOpen && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
    </div>
  );
};

export default FloatingChatbot;
