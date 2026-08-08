import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Brak prawidłowego tokenu resetującego.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Hasła nie są identyczne.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Błąd podczas zmiany hasła.');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Nowe hasło</h2>

                {error && <p className={styles.errorMsg}>{error}</p>}

                {success ? (
                    <div className={styles.successBox}>
                        <p className={styles.successMsg}>
                            🎉 Hasło zostało pomyślnie zmienione!
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Za chwilę nastąpi przekierowanie na stronę główną...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Nowe hasło</label>
                            <input
                                type="password"
                                placeholder="Wpisz nowe hasło"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Powtórz nowe hasło</label>
                            <input
                                type="password"
                                placeholder="Powtórz nowe hasło"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Zapisywanie...' : 'Zmień hasło'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;