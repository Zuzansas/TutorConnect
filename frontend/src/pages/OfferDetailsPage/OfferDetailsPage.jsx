import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './OfferDetailsPage.module.css';
import MainInfo from './components/MainInfo';
import PriceInfo from './components/PriceInfo';
import ReviewSection from './components/ReviewSection';

const OfferDetailsPage = () => {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOfferDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/lesson-offers/${id}`);

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać szczegółów oferty');
                }

                const data = await response.json();
                setOffer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOfferDetails();
    }, [id]);

    if (isLoading) return <div className={styles.loader}>Ładowanie szczegółów...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!offer) return <div className={styles.error}>Oferta nie została znaleziona.</div>;

    const mappedOffer = {
        ...offer,
        image: offer.imageUrl,
        workflow: offer.courseSteps,
        unit: `za ${offer.durationMinutes} minut`
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <MainInfo offer={mappedOffer} />
                    <ReviewSection lessonId={id} />
                </div>

                <PriceInfo
                    pricePerHour={offer.price}
                    duration={offer.durationMinutes}
                    offerId={offer.id}
                    lessonType={offer.lessonType}
                    totalLessons={offer.totalLessons}
                />
            </div>
        </div>
    );
};

export default OfferDetailsPage;