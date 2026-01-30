import { useState } from 'react';
import styles from './SignupPage.module.css';
import { FaUser, FaLock, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

const SignupPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '',
        password: '', city: '', bio: ''
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className={styles.stepContainer}>
                        <h3>Dane konta</h3>
                        <div className={styles.inputGroup}>
                            <FaUser className={styles.inputIcon} />
                            <input type="text" placeholder="Nazwa użytkownika" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <input type="email" placeholder="Adres e-mail" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <FaLock className={styles.inputIcon} />
                            <input type="password" placeholder="Hasło" required />
                        </div>
                        <button className={styles.mainBtn} onClick={nextStep}>Dalej</button>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.stepContainer}>
                        <h3>Twój profil</h3>
                        <input type="text" placeholder="Imię i nazwisko" className={styles.fullInput} />
                        <div className={styles.inputGroup}>
                            <FaMapMarkerAlt className={styles.inputIcon} />
                            <input type="text" placeholder="Miasto" />
                        </div>
                        <textarea placeholder="Twoje Bio..." className={styles.textarea}></textarea>
                        <div className={styles.btnRow}>
                            <button className={styles.secondaryBtn} onClick={prevStep}>Wróć</button>
                            <button className={styles.mainBtn} onClick={nextStep}>Ostatni krok</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.stepContainer + ' ' + styles.center}>
                        <FaCheckCircle className={styles.successIcon} />
                        <h3>Gotowe!</h3>
                        <p>Twoje konto zostało przygotowane. Możesz teraz przejść do logowania.</p>
                        <button className={styles.mainBtn}>Zakończ rejestrację</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.signupCard}>
                <div className={styles.progressTracker}>
                    <div className={`${styles.dot} ${step >= 1 ? styles.active : ''}`}></div>
                    <div className={`${styles.line} ${step >= 2 ? styles.active : ''}`}></div>
                    <div className={`${styles.dot} ${step >= 2 ? styles.active : ''}`}></div>
                    <div className={`${styles.line} ${step >= 3 ? styles.active : ''}`}></div>
                    <div className={`${styles.dot} ${step >= 3 ? styles.active : ''}`}></div>
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default SignupPage;