import React from 'react';
import styles from '../SignupPage.module.css';
import { FaArrowLeft } from 'react-icons/fa';

const ProgressTracker = ({ step, prevStep }) => {
    return (
        <div className={styles.progressTrackerContainer}>
            <FaArrowLeft
                className={styles.backIcon}
                onClick={prevStep}
                style={{
                    visibility: (step === 1 || step === 3) ? 'hidden' : 'visible',
                    color: '#bdc3c7',
                    cursor: 'pointer'
                }}
            />

            <div className={styles.progressTracker}>
                {[1, 2, 3].map((s, i) => (
                    <span key={s} style={{ display: 'contents' }}>
                        <div className={`${styles.dot} ${step >= s ? styles.active : ''}`}></div>
                        {i < 2 && <div className={`${styles.line} ${step > s ? styles.active : ''}`}></div>}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ProgressTracker;