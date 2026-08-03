import styles from './PriceInfo.module.css';
import { FiMapPin, FiShoppingCart } from "react-icons/fi";
import { FaUser, FaUsers } from 'react-icons/fa';
import { useState } from 'react';
import LoginModal from '../../../components/LoginModal/LoginModal';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const PriceInfo = ({ pricePerHour, duration, totalLessons, offerId, lessonType }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const checkAuthAndPurchase = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            executePurchase(token);
        }
    };

    // Logika zakupu pakietu na backendzie
    const executePurchase = async (token) => {
        const confirm = await Swal.fire({
            title: 'Potwierdzenie zakupu',
            html: `
                <div style="text-align: left; font-family: sans-serif; font-size: 0.95rem; line-height: 1.6;">
                    <p>Czy chcesz wykupić ten pakiet lekcji?</p>
                    <ul style="color: #555; padding-left: 20px;">
                        <li>Liczba lekcji w pakiecie: <b>${totalLessons || 4} lekcji</b></li>
                        <li>Typ zajęć: <b>${lessonType === 'GROUP' ? 'Grupowe' : 'Indywidualne'}</b></li>
                        <li>Łączna cena: <b>${pricePerHour} PLN</b></li>
                    </ul>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Kupuję pakiet',
            cancelButtonText: 'Anuluj',
            customClass: {
                popup: styles.swalSoftPopup
            }
        });

        if (confirm.isConfirmed) {
            try {
                setIsSubmitting(true);
                const response = await fetch(`http://localhost:8080/api/packages/purchase/${offerId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    await Swal.fire({
                        title: 'Zakup zakończony sukcesem!',
                        text: 'Pakiet trafił na Twoje konto. Przejdź do zakładki rezerwacji, aby wybrać terminy w kalendarzu.',
                        icon: 'success',
                        confirmButtonColor: '#d28b5b',
                        confirmButtonText: 'Moje Rezerwacje'
                    });
                    navigate('/reservations'); // Przekierowanie do strony ze stanem konta lekcji i rezerwacjami
                } else {
                    const err = await response.json();
                    Swal.fire({
                        title: 'Błąd zakupu',
                        text: err.message || 'Coś poszło nie tak podczas zakupu pakietu.',
                        icon: 'error',
                        confirmButtonColor: '#e74c3c'
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Błąd połączenia',
                    text: 'Nie udało się połączyć z serwerem.',
                    icon: 'error',
                    confirmButtonColor: '#e74c3c'
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBookingClick = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            Swal.fire({
                title: 'Wymagane logowanie',
                text: 'Aby zakupić pakiet lekcji, musisz być zalogowany w naszym serwisie.',
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

                <div className={styles.infoRow} style={{ marginTop: '10px' }}>
                    {lessonType === 'GROUP' ? <FaUsers color="#d28b5b" /> : <FaUser color="#d28b5b" />}
                    <span>{lessonType === 'GROUP' ? 'Zajęcia Grupowe' : 'Zajęcia Indywidualne'}</span>
                </div>

                <div className={styles.infoRow}>
                    <FiMapPin /> <span>Łódź / Online</span>
                </div>

                <button
                    className={styles.contactBtn}
                    onClick={handleBookingClick}
                    disabled={isSubmitting}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <FiShoppingCart /> {isSubmitting ? 'Przetwarzanie...' : 'Kup pakiet lekcji'}
                </button>

                <p className={styles.hint}>Rezerwacja terminów po zakupie pakietu</p>
            </div>

            <LoginModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    checkAuthAndPurchase();
                }}
            />
        </aside>
    );
};

export default PriceInfo;