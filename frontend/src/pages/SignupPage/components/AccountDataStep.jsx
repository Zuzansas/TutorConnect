import React from 'react';
import styles from '../SignupPage.module.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const AccountDataStep = ({ formData, handleChange, errors, handleNextStep }) => {
    return (
        <div className={styles.stepContainer}>
            <h3>Dane konta</h3>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.fullName ? styles.inputError : ''}`}>
                    <FaUser className={styles.inputIcon} />
                    <input
                        name="fullName"
                        type="text"
                        placeholder="Imię i nazwisko"
                        value={formData.fullName}
                        onChange={handleChange}
                        maxLength={60}
                    />
                </div>
                {errors.fullName && <span className={styles.errorLabel}>{errors.fullName}</span>}
            </div>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.email ? styles.inputError : ''}`}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input
                        name="email"
                        type="email"
                        placeholder="Adres e-mail"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={100}
                    />
                </div>
                {errors.email && <span className={styles.errorLabel}>{errors.email}</span>}
            </div>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.password ? styles.inputError : ''}`}>
                    <FaLock className={styles.inputIcon} />
                    <input
                        name="password"
                        type="password"
                        placeholder="Hasło (min. 8 znaków)"
                        value={formData.password}
                        onChange={handleChange}
                        maxLength={64}
                    />
                </div>
                {errors.password && <span className={styles.errorLabel}>{errors.password}</span>}
            </div>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.repeatedPassword ? styles.inputError : ''}`}>
                    <FaLock className={styles.inputIcon} />
                    <input
                        name="repeatedPassword"
                        type="password"
                        placeholder="Powtórz hasło"
                        value={formData.repeatedPassword}
                        onChange={handleChange}
                        maxLength={64}
                    />
                </div>
                {errors.repeatedPassword && <span className={styles.errorLabel}>{errors.repeatedPassword}</span>}
            </div>

            <button type="button" className={styles.mainBtn} onClick={handleNextStep}>
                Dalej
            </button>
        </div>
    );
};

export default AccountDataStep;