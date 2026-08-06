import React from 'react';
import styles from '../HowItWorksPage.module.css';
import {
    FaQuestionCircle,
    FaGraduationCap,
    FaClock,
    FaShieldAlt,
    FaBookOpen
} from 'react-icons/fa';

const HeroHeader = () => {
    return (
        <header className={styles.heroSection}>
            <div className={styles.glowBg}></div>
            <FaBookOpen className={`${styles.floatingIcon} ${styles.icon1}`} />
            <FaGraduationCap className={`${styles.floatingIcon} ${styles.icon2}`} />

            <div className={styles.badge}>
                <FaQuestionCircle className={styles.badgeIcon} />
                <span>Przewodnik po platformie</span>
            </div>

            <h1 className={styles.heroTitle}>
                Jak rozpocząć naukę w <br className={styles.breakDesktop} />
                <span className={styles.gradientText}>naszym serwisie</span>?
            </h1>

            <p className={styles.heroSubtitle}>
                Prosty proces wyboru korepetycji, elastyczne pakiety lekcji i rezerwacja terminów w dogodnej chwili. Sprawdź, jak krok po kroku zdobywać wiedzę!
            </p>
            <div className={styles.heroHighlights}>
                <div className={styles.highlightCard}>
                    <FaClock className={styles.highlightIcon} />
                    <div>
                        <strong>Rezerwacja 24/7</strong>
                        <span>W dowolnym momencie</span>
                    </div>
                </div>

                <div className={styles.highlightCard}>
                    <FaGraduationCap className={styles.highlightIcon} />
                    <div>
                        <strong>Pakiety lekcji</strong>
                        <span>Oszczędzaj czas i środki</span>
                    </div>
                </div>

                <div className={styles.highlightCard}>
                    <FaShieldAlt className={styles.highlightIcon} />
                    <div>
                        <strong>Jasne zasady</strong>
                        <span>Bezpłatne odwoływanie do 12h</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeroHeader;