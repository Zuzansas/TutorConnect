import React, { useState } from 'react';
import styles from './ContactPage.module.css';
import {
    FaEnvelope,
    FaPhoneAlt,
    FaClock,
    FaMapMarkerAlt,
    FaCopy,
    FaCheck,
    FaPaperPlane
} from 'react-icons/fa';

const ContactPage = () => {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);

    const email = 'kontakt@korepetycje.pl';
    const phone = '+48 123 456 789';

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'email') {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        } else {
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2000);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Skontaktuj się z nami</h1>
                    <p>Masz pytania dotyczące lekcji lub pakietów? Jesteśmy do Twojej dyspozycji!</p>
                </div>

                <div className={styles.contactList}>

                    <div className={styles.contactItem}>
                        <div className={styles.iconBox}>
                            <FaEnvelope />
                        </div>
                        <div className={styles.details}>
                            <span className={styles.label}>Napisz e-mail</span>
                            <a href={`mailto:${email}`} className={styles.value}>{email}</a>
                        </div>
                        <button
                            className={styles.copyBtn}
                            onClick={() => handleCopy(email, 'email')}
                            title="Kopiuj e-mail"
                        >
                            {copiedEmail ? <FaCheck style={{ color: '#2ecc71' }} /> : <FaCopy />}
                        </button>
                    </div>


                    <div className={styles.contactItem}>
                        <div className={styles.iconBox}>
                            <FaPhoneAlt />
                        </div>
                        <div className={styles.details}>
                            <span className={styles.label}>Zadzwoń do nas</span>
                            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.value}>{phone}</a>
                        </div>
                        <button
                            className={styles.copyBtn}
                            onClick={() => handleCopy(phone, 'phone')}
                            title="Kopiuj numer"
                        >
                            {copiedPhone ? <FaCheck style={{ color: '#2ecc71' }} /> : <FaCopy />}
                        </button>
                    </div>

                    <div className={styles.contactItem}>
                        <div className={styles.iconBox}>
                            <FaClock />
                        </div>
                        <div className={styles.details}>
                            <span className={styles.label}>Godziny pracy wsparcia</span>
                            <span className={styles.valueText}>Pn. – Pt.: 8:00 – 20:00</span>
                            <span className={styles.subText}>Soboty: 9:00 – 15:00</span>
                        </div>
                    </div>
                </div>


                <div className={styles.actions}>
                    <a href={`mailto:${email}`} className={styles.primaryBtn}>
                        <FaPaperPlane /> Wyślij e-mail bezpośrednio
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;