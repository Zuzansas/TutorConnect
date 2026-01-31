import styles from './OffersPage.module.css';
import { Link } from 'react-router-dom';

const offers = [
    {
        id: 1,
        title: "Korepetycje z Matematyki - Matura",
        price: "60 PLN / h",
        image: "https://images.unsplash.com/photo-1509228468518-180dd48a579a?q=80&w=500",
    },
    {
        id: 2,
        title: "Kurs Programowania Java od Podstaw",
        price: "120 PLN / h",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=500",
    },
    {
        id: 3,
        title: "Język Angielski - Konwersacje C1",
        price: "80 PLN / h",
        image: "https://images.unsplash.com/photo-1543167606-93b5e622a77f?q=80&w=500",
    }
];

const OffersPage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Dostępne Oferty</h1>
            <div className={styles.offersGrid}>
                {offers.map((offer) => (
                    <section key={offer.id} className={styles.offerSection}>
                        <div className={styles.imageWrapper}>
                            <img src={offer.image} alt={offer.title} className={styles.offerImage} />
                        </div>
                        <div className={styles.offerDetails}>
                            <h2 className={styles.title}>{offer.title}</h2>
                            <p className={styles.price}>{offer.price}</p>
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