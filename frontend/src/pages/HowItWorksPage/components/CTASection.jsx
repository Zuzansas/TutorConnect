import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../HowItWorksPage.module.css';
import { FaArrowRight } from 'react-icons/fa';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className={styles.ctaSection}>
            <h2>Gotowy na rozpoczęcie nauki?</h2>
            <p>Przejrzyj dostępne oferty korepetycji i wybierz idealny pakiet dla siebie.</p>
            <button className={styles.ctaBtn} onClick={() => navigate('/offers')}>
                Zobacz Oferty Lekcji <FaArrowRight />
            </button>
        </section>
    );
};

export default CTASection;