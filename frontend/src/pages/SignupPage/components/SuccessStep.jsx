import React from 'react';
import styles from '../SignupPage.module.css';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessStep = ({ onFinish }) => {
    return (
        <div className={styles.stepContainer} style={{ textAlign: 'center', alignItems: 'center' }}>
            <FaCheckCircle className={styles.successIcon} />
            <h3>Gotowe!</h3>
            <p>Twoje konto zostało utworzone. Zaraz nastąpi przekierowanie do strony głównej...</p>
            <button className={styles.mainBtn} onClick={onFinish}>
                Przejdź do strony głównej
            </button>
        </div>
    );
};

export default SuccessStep;