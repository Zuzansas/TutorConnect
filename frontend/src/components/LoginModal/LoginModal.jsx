import styles from './LoginModal.module.css';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <h2>Zaloguj się</h2>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Adres e-mail"
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            required
          />
          <button type="submit" className={styles.submitBtn}>
            Zaloguj się
          </button>
          <div className={styles.signInLink}>
            Nie masz konta? <a href="#signup" onClick={onClose}>Zarejestruj się</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;