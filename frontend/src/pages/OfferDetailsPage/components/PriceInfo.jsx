import styles from './PriceInfo.module.css';
import { FiMapPin } from "react-icons/fi";

const PriceInfo = ({ pricePerHour, location }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.priceCard}>
                <div className={styles.priceTag}>
                    <span className={styles.amount}>{pricePerHour}</span>
                    <span className={styles.unit}>PLN / 60 min</span>
                </div>

                <div className={styles.infoRow}>
                    <FiMapPin /> <span>{location}</span>
                </div>

                <button className={styles.contactBtn}>Zarezerwuj termin</button>
                <p className={styles.hint}>Odpowiada zazwyczaj w ciągu 2h</p>
            </div>
        </aside>
    );
}

export default PriceInfo;