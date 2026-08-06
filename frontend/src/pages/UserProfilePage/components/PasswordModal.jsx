import React from 'react';
import styles from '../UserProfilePage.module.css';
import { FaTimes } from 'react-icons/fa';

const PasswordModal = ({
    showPasswordModal,
    setShowPasswordModal,
    message,
    passwordForm,
    setPasswordForm,
    handleChangePassword
}) => {
    if (!showPasswordModal) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Zmień hasło</h2>
                    <button onClick={() => setShowPasswordModal(false)} className={styles.closeModal}>
                        <FaTimes />
                    </button>
                </div>

                {message.text && message.type === 'error' && (
                    <div className={styles.modalError}>{message.text}</div>
                )}

                <form onSubmit={handleChangePassword}>
                    <div className={styles.inputGroupModal}>
                        <label>Aktualne hasło</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputGroupModal}>
                        <label>Nowe hasło</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputGroupModal}>
                        <label>Powtórz nowe hasło</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                    </div>
                    <button type="submit" className={styles.saveBtnFull}>Zapisz nowe hasło</button>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;