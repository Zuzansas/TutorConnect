import styles from './OffersPage.module.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setIsAdmin(role === 'ADMIN');

        const fetchOffers = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:8080/api/lesson-offers/all');

                if (!response.ok) {
                    throw new Error('Wystąpił błąd podczas pobierania danych');
                }

                const data = await response.json();
                setOffers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę ofertę?")) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/lesson-offers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setOffers(offers.filter(offer => offer.id !== id));
                alert("Oferta została usunięta.");
            } else {
                alert("Błąd podczas usuwania oferty.");
            }
        } catch (err) {
            console.error("Błąd sieci:", err);
        }
    };

    if (isLoading) return <div className={styles.loading}>Ładowanie ofert...</div>;
    if (error) return <div className={styles.error}>Błąd: {error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Dostępne Oferty</h1>
            <div className={styles.offersGrid}>
                {offers.map((offer) => (
                    <section key={offer.id} className={styles.offerSection}>
                        {isAdmin && (
                            <div className={styles.adminActions}>
                                <Link to={`/edit-offer/${offer.id}`} className={styles.editBtn} title="Edytuj">
                                    <FiEdit2 />
                                </Link>
                                <button
                                    onClick={() => handleDelete(offer.id)}
                                    className={styles.deleteBtn}
                                    title="Usuń"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        )}

                        <div className={styles.imageWrapper}>
                            <img src={offer.imageUrl} alt={offer.title} className={styles.offerImage} />
                        </div>
                        <div className={styles.offerDetails}>
                            <h2 className={styles.title}>{offer.title}</h2>
                            <p className={styles.price}>{offer.price} PLN / {offer.durationMinutes} min</p>
                            <Link to={`/offer/${offer.id}`} className={styles.viewBtn}>
                                Zobacz ofertę
                            </Link>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default OffersPage;