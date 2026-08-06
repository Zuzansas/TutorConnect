import React from 'react';
import styles from '../SignupPage.module.css';
import { FaUser, FaMapMarkerAlt, FaBook } from 'react-icons/fa';
import ImageUpload from './ImageUpload';

const ProfileDetailsStep = ({
    formData,
    handleChange,
    avatarFile,
    setAvatarFile,
    cityQuery,
    handleCityChange,
    showSuggestions,
    setShowSuggestions,
    filteredCities,
    selectCity,
    handleRegister,
    isLoading,
    errors
}) => {
    return (
        <div className={styles.stepContainer}>
            <h3>Twój profil</h3>

            <div className={styles.inputGroup}>
                <ImageUpload
                    image={avatarFile}
                    onImageChange={setAvatarFile}
                    onRemoveImage={() => setAvatarFile(null)}
                    currentImageUrl={null}
                />
            </div>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.fullName ? styles.inputError : ''}`}>
                    <FaUser className={styles.inputIcon} />
                    <input
                        name="fullName"
                        type="text"
                        placeholder="Imię i nazwisko"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        maxLength={60}
                    />
                </div>
                {errors.fullName && <span className={styles.errorLabel}>{errors.fullName}</span>}
            </div>

            <div className={styles.inputWrapper}>
                <div className={styles.inputGroup} style={{ position: 'relative' }}>
                    <FaMapMarkerAlt className={styles.inputIcon} />
                    <input
                        type="text"
                        placeholder="Wybierz miasto..."
                        value={cityQuery}
                        onChange={handleCityChange}
                        onFocus={() => cityQuery.length >= 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                        maxLength={50}
                    />

                    {showSuggestions && filteredCities.length > 0 && (
                        <ul className={styles.suggestionsList}>
                            {filteredCities.map((city, index) => (
                                <li key={index} onMouseDown={() => selectCity(city)}>
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {errors.city && <span className={styles.errorLabel}>{errors.city}</span>}
            </div>

            <div className={styles.inputWrapper}>
                <div className={`${styles.inputGroup} ${errors.bio ? styles.inputError : ''}`}>
                    <FaBook className={styles.textareaIcon} style={{ color: '#bdc3c7' }} />
                    <textarea
                        name="bio"
                        placeholder="Opowiedz coś o sobie (Bio)..."
                        className={styles.textarea}
                        value={formData.bio}
                        onChange={handleChange}
                        maxLength={500}
                    />
                </div>
                {errors.bio && <span className={styles.errorLabel}>{errors.bio}</span>}
            </div>

            <div className={styles.btnRow}>
                <button
                    type="button"
                    className={styles.mainBtn}
                    onClick={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? 'Przetwarzanie...' : 'Zakończ rejestrację'}
                </button>
            </div>
        </div>
    );
};

export default ProfileDetailsStep;