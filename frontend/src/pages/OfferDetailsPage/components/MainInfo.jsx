import styles from './MainInfo.module.css';
import { FiInfo, FiClock, FiCheckCircle } from "react-icons/fi";


const MainInfo = ({ offer }) => {
    return (
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
    );
}

export default MainInfo;