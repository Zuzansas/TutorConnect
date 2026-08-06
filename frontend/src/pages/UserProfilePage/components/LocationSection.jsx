import React from 'react';
import styles from '../UserProfilePage.module.css';
import { FaMapMarkerAlt, FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';

const LocationSection = ({
    userData,
    isEditingLocation,
    setIsEditingLocation,
    cityQuery,
    handleCityChange,
    handleSaveCity,
    showSuggestions,
    filteredCities,
    selectCity
}) => {
    return (
        <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
                <h3><FaMapMarkerAlt className={styles.headerIcon} /> Lokalizacja</h3>
                {!isEditingLocation && (
                    <button className={styles.editBtn} onClick={() => setIsEditingLocation(true)}>
                        <FaPencilAlt /> Zmień
                    </button>
                )}
            </div>

            <div className={styles.infoFields}>
                <div className={styles.fieldGroupFull}>
                    <label>Miejscowość</label>
                    {isEditingLocation ? (
                        <div className={styles.citySearchContainer}>
                            <input
                                type="text"
                                className={styles.editInput}
                                value={cityQuery}
                                onChange={handleCityChange}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveCity()}
                                placeholder="Wpisz nazwę miasta..."
                            />
                            {showSuggestions && filteredCities.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {filteredCities.map((city, index) => (
                                        <li key={index} onClick={() => selectCity(city)}>{city}</li>
                                    ))}
                                </ul>
                            )}
                            <div className={styles.locationActions}>
                                <button className={styles.saveBtn} onClick={handleSaveCity}>
                                    <FaSave /> Zapisz
                                </button>
                                <button className={styles.cancelBtn} onClick={() => setIsEditingLocation(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className={styles.infoText}>{userData?.city || 'Nie podano miejscowości'}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationSection;