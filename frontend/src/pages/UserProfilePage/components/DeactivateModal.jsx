import React from 'react';
import styles from '../UserProfilePage.module.css';
import { FaExclamationTriangle } from 'react-icons/fa';

const DeactivateModal = ({
    showDeactivateModal,
    setShowDeactivateModal,
    handleDeactivate
}) => {
    if (!showDeactivateModal) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.deactivateHeader}>
                    <FaExclamationTriangle size={44} color="#e74c3c" />
                    <h2>Czy na pewno chcesz deaktywować konto?</h2>
                </div>
                <p className={styles.deactivateText}>
                    Deaktywacja konta sprawi, że Twój profil przestanie być widoczny dla innych użytkowników serwisu.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.dangerBtnFull} onClick={handleDeactivate}>
                        Tak, deaktywuj konto
                    </button>
                    <button className={styles.cancelBtnFull} onClick={() => setShowDeactivateModal(false)}>
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeactivateModal;