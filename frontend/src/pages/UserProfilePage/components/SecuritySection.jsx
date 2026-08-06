import React from 'react';
import styles from '../UserProfilePage.module.css';
import { FaLock, FaKey, FaUserSlash } from 'react-icons/fa';

const SecuritySection = ({ setShowPasswordModal, setShowDeactivateModal }) => {
    return (
        <div className={`${styles.cardSection} ${styles.securityBox}`}>
            <div className={styles.sectionHeader}>
                <h3><FaLock className={styles.headerIcon} /> Bezpieczeństwo konta</h3>
            </div>

            <div className={styles.securityGrid}>
                <div className={styles.securityOption}>
                    <div>
                        <h4>Zmień hasło dostępu</h4>
                        <p>Zalecamy regularną zmianę hasła w celu ochrony konta.</p>
                    </div>
                    <button className={styles.outlineBtn} onClick={() => setShowPasswordModal(true)}>
                        <FaKey /> Zmień hasło
                    </button>
                </div>

                <div className={styles.securityOption}>
                    <div>
                        <h4>Deaktywacja konta</h4>
                        <p>Ukryj swój profil przed innymi użytkownikami serwisu.</p>
                    </div>
                    <button className={styles.dangerBtn} onClick={() => setShowDeactivateModal(true)}>
                        <FaUserSlash /> Deaktywuj
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySection;