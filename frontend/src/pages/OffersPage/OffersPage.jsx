import styles from './OffersPage.module.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react'


const OffersPage = () => {

    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('accessToken');

                const response = await fetch('http://localhost:8080/api/lesson-offers/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });

                if (response.status === 401) {
                    throw new Error('Twoja sesja wygasła. Zaloguj się ponownie.');
                }

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
    if (isLoading) return <div className={styles.loading}>Ładowanie ofert...</div>;
    if (error) return <div className={styles.error}>Błąd: {error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Dostępne Oferty</h1>
            <div className={styles.offersGrid}>
                {offers.map((offer) => (
                    <section key={offer.id} className={styles.offerSection}>
                        <div className={styles.imageWrapper}>
                            <img src={offer.imageUrl} alt={offer.title} className={styles.offerImage} />
                        </div>
                        <div className={styles.offerDetails}>
                            <h2 className={styles.title}>{offer.title}</h2>
                            <p className={styles.price}>{offer.price} PLN/{offer.duration}</p>
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