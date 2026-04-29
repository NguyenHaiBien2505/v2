import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  role: 'user' | 'bot';
  text: string;
  time: string;
}

const MessageBubble = ({ role, text, time }: MessageBubbleProps) => {
  return (
    <article className={`${styles.msg} ${role === 'user' ? styles.msgUser : styles.msgBot}`}>
      <div className={styles.bubble}>
        {role === 'bot' ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        ) : (
          text
        )}
      </div>
      <time className={styles.time}>{time}</time>
    </article>
  );
};

export default MessageBubble;
