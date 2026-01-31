import React from 'react';
import styles from './OfferDetailsPage.module.css';
import { FiClock, FiMapPin, FiCheckCircle, FiInfo } from "react-icons/fi";

const OfferDetailsPage = () => {
    const offer = {
        title: "Korepetycje z Matematyki - Poziom Rozszerzony",
        price: "80 PLN",
        unit: "za 60 minut",
        location: "Łódź / Online",
        description: "Zapraszam na profesjonalne korepetycje z matematyki. Skupiamy się na przygotowaniu do matury rozszerzonej oraz bieżącym materiale szkolnym. Tłumaczę zagadnienia w sposób prosty i logiczny, bez zbędnego wkuwania wzorów.",
        workflow: [
            "Analiza braków i wspólne ustalenie planu nauki.",
            "Praca na autentycznych arkuszach maturalnych.",
            "Dostęp do autorskich notatek i zadań domowych.",
            "Stały kontakt na WhatsApp w razie problemów z zadaniami."
        ],
        aboutTeacher: "Student informatyki z 3-letnim doświadczeniem w udzielaniu korepetycji. Laureat olimpiad matematycznych.",
        image: "https://images.unsplash.com/photo-1509228468518-180dd48a579a?q=80&w=1000"
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <img src={offer.image} alt={offer.title} className={styles.mainImage} />

                    <h1 className={styles.title}>{offer.title}</h1>

                    <div className={styles.section}>
                        <h3><FiInfo className={styles.icon} /> Opis oferty</h3>
                        <p>{offer.description}</p>
                    </div>

                    <div className={styles.section}>
                        <h3><FiClock className={styles.icon} /> Przebieg zajęć</h3>
                        <ul className={styles.workflowList}>
                            {offer.workflow.map((item, index) => (
                                <li key={index}><FiCheckCircle className={styles.check} /> {item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h3>O mnie</h3>
                        <p>{offer.aboutTeacher}</p>
                    </div>
                </div>
                <aside className={styles.sidebar}>
                    <div className={styles.priceCard}>
                        <div className={styles.priceTag}>
                            <span className={styles.amount}>{offer.price}</span>
                            <span className={styles.unit}>{offer.unit}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <FiMapPin /> <span>{offer.location}</span>
                        </div>

                        <button className={styles.contactBtn}>Zarezerwuj termin</button>
                        <p className={styles.hint}>Odpowiada zazwyczaj w ciągu 2h</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default OfferDetailsPage;