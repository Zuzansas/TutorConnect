import styles from './PriceInfo.module.css';
import { FiMapPin, FiShoppingCart } from "react-icons/fi";
import { FaUser, FaUsers } from 'react-icons/fa';
import { useState } from 'react';
import LoginModal from '../../../components/LoginModal/LoginModal';
import Swal from 'sweetalert2';

const PriceInfo = ({ pricePerHour, duration, totalLessons, offerId, lessonType }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const executePurchase = async (token) => {
        const confirm = await Swal.fire({
            title: 'Przejście do płatności',
            html: `
                <div style="text-align: left; font-family: sans-serif; font-size: 0.95rem; line-height: 1.6;">
                    <p>Zostaniesz przekierowany do bezpiecznej płatności Stripe za pakiet:</p>
                    <ul style="color: #555; padding-left: 20px;">
                        <li>Liczba lekcji: <b>${totalLessons || 4} lekcji</b></li>
                        <li>Łączna cena: <b>${pricePerHour} PLN</b></li>
                    </ul>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Zapłać teraz',
            cancelButtonText: 'Anuluj'
        });

        if (confirm.isConfirmed) {
            try {
                setIsSubmitting(true);
                const response = await fetch(`http://localhost:8080/api/packages/create-checkout-session/${offerId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    window.location.href = data.checkoutUrl;
                } else if (response.status === 401) {
                    // ⬇️ Token wygasł lub jest niepoprawny
                    localStorage.removeItem('accessToken'); // Czyścimy stary token
                    Swal.fire({
                        title: 'Sesja wygasła',
                        text: 'Zaloguj się ponownie, aby dokończyć zakup.',
                        icon: 'warning'
                    }).then(() => {
                        setIsModalOpen(true); // Otwiera modal logowania
                    });
                } else {
                    const err = await response.json();
                    Swal.fire('Błąd', err.message || 'Nie udało się rozpocząć płatności.', 'error');
                }
            } catch (error) {
                Swal.fire('Błąd połączenia', 'Nie udało się połączyć z serwerem.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBookingClick = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsModalOpen(true);
        } else {
            executePurchase(token);
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.priceCard}>
                <div className={styles.priceTag}>
                    <span className={styles.amount}>{pricePerHour} zł</span>
                    <span className={styles.unit}>Pakiet {totalLessons || 4}x {duration || 60} min</span>
                </div>

                <button
                    className={styles.contactBtn}
                    onClick={handleBookingClick}
                    disabled={isSubmitting}
                >
                    <FiShoppingCart /> {isSubmitting ? 'Inicjalizacja płatności...' : 'Kup pakiet lekcji'}
                </button>
            </div>

            <LoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </aside>
    );
};

export default PriceInfo;