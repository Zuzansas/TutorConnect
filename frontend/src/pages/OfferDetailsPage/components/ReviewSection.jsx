import { useEffect, useState } from 'react';
import styles from './ReviewSection.module.css';
import { FaStar, FaUserCircle, FaQuoteLeft } from 'react-icons/fa';

const ReviewSection = ({ lessonId }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/lesson/${lessonId}`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Błąd pobierania opinii:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) fetchReviews();
    }, [lessonId]);

    if (isLoading) return <div className={styles.loader}>Ładowanie opinii...</div>;

    return (
        <section className={styles.reviewSection}>
            <h2 className={styles.sectionTitle}>
                Opinie uczniów ({reviews.length})
            </h2>

            {reviews.length > 0 ? (
                <div className={styles.reviewsGrid}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <FaUserCircle className={styles.userIcon} />
                                    <div>
                                        <span className={styles.authorName}>{review.authorName}</span>
                                        <span className={styles.date}>
                                            {new Date(review.createdAt).toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.rating}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < review.rating ? styles.starFilled : styles.starEmpty}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className={styles.content}>
                                <FaQuoteLeft className={styles.quoteIcon} />
                                <p>{review.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    Brak opinii dla tych zajęć. Bądź pierwszym uczniem, który wystawi ocenę!
                </div>
            )}
        </section>
    );
};

export default ReviewSection;