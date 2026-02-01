import styles from './OfferDetailsPage.module.css';
import MainInfo from './components/MainInfo';
import PriceInfo from './components/PriceInfo';

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
                <MainInfo offer={offer} />
                <PriceInfo pricePerHour={offer.price} location={offer.location} />
            </div>
        </div>
    );
};

export default OfferDetailsPage;