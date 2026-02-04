import styles from './PriceInfo.module.css';
import { FiMapPin } from "react-icons/fi";

const PriceInfo = ({ pricePerHour, duration }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.priceCard}>
                <div className={styles.priceTag}>
                    <span className={styles.amount}>{pricePerHour}</span>
                    <span className={styles.unit}> {duration} min</span>
                </div>

                <div className={styles.infoRow}>
                    <FiMapPin /> <span>Łódź/Online</span>

                </div>

                <button className={styles.contactBtn}>Zarezerwuj termin</button>
                <p className={styles.hint}>Odpowiada zazwyczaj w ciągu 2h</p>
            </div>
        </aside>
    );
}

export default PriceInfo;