import styles from './PriceInfo.module.css';
import { FiMapPin } from "react-icons/fi";
import { useState } from 'react';
import LoginModal from '../../../components/LoginModal/LoginModal';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const PriceInfo = ({ pricePerHour, duration, offerId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('accessToken');

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            console.log("Użytkownik zalogowany pomyślnie");
        }
    };

    const handleBookingClick = () => {
        if (!isAuthenticated) {
            Swal.fire({
                title: 'Wymagane logowanie',
                text: 'Aby zarezerwować termin, musisz być zalogowany w naszym serwisie.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#d28b5b',
                cancelButtonColor: '#95a5a6',
                confirmButtonText: 'Zaloguj się',
                cancelButtonText: 'Anuluj',
                customClass: {
                    popup: styles.swalSoftPopup
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsModalOpen(true);
                }
            });
        } else {
            navigate(`/book/${offerId}`);
        }
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.priceCard}>
                <div className={styles.priceTag}>
                    <span className={styles.amount}>{pricePerHour} zł</span>
                    <span className={styles.unit}> / {duration} min</span>
                </div>

                <div className={styles.infoRow}>
                    <FiMapPin /> <span>Łódź / Online</span>
                </div>

                <button
                    className={styles.contactBtn}
                    onClick={handleBookingClick}
                >
                    Zarezerwuj termin
                </button>

                <p className={styles.hint}>Odpowiada zazwyczaj w ciągu 2h</p>
            </div>

            <LoginModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    checkAuth();
                }}
            />
        </aside>
    );
}

export default PriceInfo;