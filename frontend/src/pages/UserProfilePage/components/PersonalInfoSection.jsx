import React from 'react';
import styles from '../UserProfilePage.module.css';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const PersonalInfoSection = ({
    userData,
    isEditing,
    setIsEditing,
    profileForm,
    setProfileForm,
    handleUpdateProfile
}) => {
    return (
        <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
                <h3><FaUser className={styles.headerIcon} /> Dane osobowe</h3>
                {!isEditing ? (
                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <FaEdit /> Edytuj
                    </button>
                ) : (
                    <div className={styles.editActions}>
                        <button className={styles.saveBtn} onClick={handleUpdateProfile}>
                            <FaSave /> Zapisz
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                            <FaTimes />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.infoFields}>
                <div className={styles.fieldGroup}>
                    <label>Imię i nazwisko</label>
                    {isEditing ? (
                        <input
                            className={styles.editInput}
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        />
                    ) : (
                        <span className={styles.infoText}>{userData?.fullName}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label><FaEnvelope /> Email</label>
                    <span className={styles.infoText}>{userData?.email}</span>
                </div>

                <div className={styles.fieldGroupFull}>
                    <label>O mnie (Bio)</label>
                    {isEditing ? (
                        <textarea
                            className={styles.editTextarea}
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            placeholder="Napisz parę słów o sobie..."
                        />
                    ) : (
                        <p className={styles.bioText}>{userData?.bio || 'Brak opisu w profilu...'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoSection;