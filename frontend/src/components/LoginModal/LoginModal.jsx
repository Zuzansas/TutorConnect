import { useState } from 'react';
import styles from './LoginModal.module.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Błąd logowania');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userRole', data.role);

      handleClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Nie udało się wysłać linku resetującego.');
      }

      setSuccessMsg('Link do resetowania hasła został wysłany na podany e-mail!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    setIsResetMode(false);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>×</button>

        <h2>{isResetMode ? 'Resetowanie hasła' : 'Zaloguj się'}</h2>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {successMsg && (
          <p className={styles.successMsg} style={{ color: '#2ecc71', fontSize: '0.9rem', marginBottom: '15px' }}>
            {successMsg}
          </p>
        )}

        {!isResetMode ? (

          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />


            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>

            <div className={styles.signInLink}>
              Nie masz konta? <a href="/signup" onClick={handleClose}>Zarejestruj się</a>
            </div>
            <div style={{ textAlign: 'center', marginTop: '-5px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => { setIsResetMode(true); setError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#d28b5b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Zapomniałeś hasła?
              </button>
            </div>
          </form>
        ) : (

          <form className={styles.form} onSubmit={handleResetSubmit}>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px', lineHeight: '1.4' }}>
              Wpisz swój adres e-mail. Wyślemy Ci wiadomość z instrukcją ustawienia nowego hasła.
            </p>

            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
            </button>

            <div className={styles.signInLink} style={{ marginTop: '15px' }}>
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#d28b5b', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Powrót do logowania
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;