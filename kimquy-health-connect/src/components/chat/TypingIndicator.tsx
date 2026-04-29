import styles from './TypingIndicator.module.css';

const TypingIndicator = () => (
  <div className={styles.wrapper} aria-label="Bot đang gõ..." role="status">
    <span className={styles.dot} />
    <span className={styles.dot} />
    <span className={styles.dot} />
  </div>
);

export default TypingIndicator;
