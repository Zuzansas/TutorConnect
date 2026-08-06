import React from 'react';
import styles from '../HowItWorksPage.module.css';

const StepCard = ({ number, icon: Icon, title, description, delay }) => {
    return (
        <div
            className={styles.stepCard}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className={styles.stepNumber}>{number}</div>
            <div className={styles.iconBox}>
                <Icon />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

export default StepCard;