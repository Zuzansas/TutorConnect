import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymentSuccessPage.module.css';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            navigate('/reservations');
        }, 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon}>🎉</div>
                <h2>Płatność zakończona sukcesem!</h2>
                <p>Twój pakiet lekcji został aktywowany i dodany do Twojego konta.</p>

                <div className={styles.redirectBox}>
                    <p>Za chwilę nastąpi przekierowanie do Twoich rezerwacji...</p>
                    <span className={styles.badge}>{countdown}s</span>
                </div>

                <button
                    className={styles.btn}
                    onClick={() => navigate('/reservations')}
                >
                    Przejdź do rezerwacji teraz
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;