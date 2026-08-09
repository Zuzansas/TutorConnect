import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './ActivateAccountPage.module.css';

const ActivateAccountPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('Trwa aktywacja Twojego konta...');


    const hasCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Brak tokenu aktywacyjnego w adresie URL.');
            return;
        }

        if (hasCalled.current) return;
        hasCalled.current = true;

        const activateAccount = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/auth/activate-account?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('🎉 Twoje konto zostało pomyślnie aktywowane!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Nie udało się aktywować konta.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Błąd połączenia z serwerem.');
            }
        };

        activateAccount();
    }, [token]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Aktywacja Konta</h2>

                {status === 'pending' && <p className={styles.info}>{message}</p>}

                {status === 'success' && (
                    <div>
                        <p className={styles.success}>{message}</p>
                        <button className={styles.btn} onClick={() => navigate('/')}>
                            Przejdź do logowania
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <p className={styles.error}>{message}</p>
                        <button className={styles.btn} onClick={() => navigate('/')}>
                            Wróć do strony głównej
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivateAccountPage;