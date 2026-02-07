import { useState, useEffect } from 'react';
import styles from './UserProfilePage.module.css';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaLock, FaEdit, FaSave, FaTimes, FaPencilAlt, FaExclamationTriangle } from 'react-icons/fa';
import ImageUpload from '../SignupPage/components/ImageUpload';
import { City } from 'country-state-city';

const UserProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });


    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);


    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [cityQuery, setCityQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const allPolishCities = City.getCitiesOfCountry('PL').map(c => c.name);

    const [profileForm, setProfileForm] = useState({ fullName: '', bio: '' });
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setProfileForm({ fullName: data.fullName, bio: data.bio });
                setCityQuery(data.city || '');
            }
        } catch (error) {
            console.error("Błąd pobierania profilu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Nowe hasła nie są identyczne!' });
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/users/me/password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmNewPassword: passwordForm.confirmPassword
                })
            });

            const result = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Hasło zostało zmienione!' });
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: result.message || 'Błąd zmiany hasła.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Błąd połączenia z serwerem.' });
        }
    };

    const handleDeactivate = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/me/deactivate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                localStorage.clear();
                window.location.href = '/login';
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Nie udało się deaktywować konta.' });
        }
    };

    const handleSaveCity = () => { if (cityQuery.trim()) selectCity(cityQuery); };
    const handleCityChange = (e) => {
        const value = e.target.value;
        setCityQuery(value);
        if (value.length >= 2) {
            const filtered = allPolishCities.filter(city => city.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
            setFilteredCities(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };
    const selectCity = async (city) => {
        setCityQuery(city);
        setShowSuggestions(false);
        try {
            const response = await fetch('http://localhost:8080/api/users/me/location', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: city })
            });
            if (response.ok) { fetchProfile(); setIsEditingLocation(false); setMessage({ type: 'success', text: 'Lokalizacja zaktualizowana!' }); }
        } catch (error) { setMessage({ type: 'error', text: 'Błąd lokalizacji.' }); }
    };
    const handleAvatarUpdate = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:8080/api/users/me/avatar', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) { setMessage({ type: 'success', text: 'Avatar zaktualizowany!' }); fetchProfile(); }
        } catch (error) { setMessage({ type: 'error', text: 'Błąd wgrywania zdjęcia.' }); }
    };
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/users/me', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });
            if (response.ok) { setMessage({ type: 'success', text: 'Profil zaktualizowany!' }); setIsEditing(false); fetchProfile(); }
        } catch (error) { setMessage({ type: 'error', text: 'Błąd profilu.' }); }
    };

    if (isLoading) return <div className={styles.loader}>Ładowanie profilu...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                {message.text && (
                    <div className={`${styles.alert} ${styles[message.type]}`}>{message.text}</div>
                )}

                <div className={styles.header}>
                    <ImageUpload
                        image={null}
                        currentImageUrl={userData?.avatarUrl}
                        onImageChange={handleAvatarUpdate}
                        onRemoveImage={() => { }}
                    />
                    <h1>{userData?.fullName}</h1>
                    <p className={styles.username}>@{userData?.email.split('@')[0]}</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3><FaUser /> Dane osobowe</h3>
                        {!isEditing ? (
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                <FaEdit /> Edytuj dane
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.saveBtn} onClick={handleUpdateProfile}><FaSave /> Zapisz</button>
                                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}><FaTimes /></button>
                            </div>
                        )}
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>Imię i nazwisko</label>
                            {isEditing ? (
                                <input className={styles.editInput} value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                            ) : <span className={styles.infoText}>{userData?.fullName}</span>}
                        </div>

                        <div className={styles.bioSection}>
                            <label>O mnie (Bio)</label>
                            {isEditing ? (
                                <textarea className={styles.editTextarea} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
                            ) : <p className={styles.bioText}>{userData?.bio || 'Brak opisu...'}</p>}
                        </div>

                        <div className={styles.infoItem}>
                            <label><FaEnvelope /> Email</label>
                            <span className={styles.infoText}>{userData?.email}</span>
                        </div>

                        <div className={styles.infoItem} style={{ marginTop: '15px' }}>
                            <label>
                                <FaMapMarkerAlt /> Lokalizacja
                                {!isEditingLocation && (
                                    <FaPencilAlt className={styles.miniEditIcon} onClick={() => setIsEditingLocation(true)} />
                                )}
                            </label>
                            {isEditingLocation ? (
                                <div className={styles.citySearchContainer}>
                                    <input type="text" className={styles.editInput} value={cityQuery} onChange={handleCityChange} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveCity()} />
                                    {showSuggestions && filteredCities.length > 0 && (
                                        <ul className={styles.suggestionsList}>
                                            {filteredCities.map((city, index) => (
                                                <li key={index} onClick={() => selectCity(city)}>{city}</li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className={styles.locationActions}>
                                        <button className={styles.saveSmall} onClick={handleSaveCity}><FaSave /> Zapisz</button>
                                        <button className={styles.cancelIconBtn} onClick={() => setIsEditingLocation(false)}><FaTimes /></button>
                                    </div>
                                </div>
                            ) : (
                                <span className={styles.infoText}>{userData?.city || 'Nie podano'}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`${styles.section} ${styles.securitySection}`}>
                    <h3><FaLock /> Bezpieczeństwo</h3>
                    <div className={styles.securityButtons}>
                        <button className={styles.outlineBtn} onClick={() => setShowPasswordModal(true)}>
                            Zmień hasło
                        </button>
                        <button className={styles.dangerBtn} onClick={() => setShowDeactivateModal(true)}>
                            Deaktywuj konto
                        </button>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Zmień hasło</h2>
                            <button onClick={() => setShowPasswordModal(false)} className={styles.closeModal}><FaTimes /></button>
                        </div>
                        {message.text && message.type === 'error' && (
                            <div className={styles.modalError}>{message.text}</div>
                        )}
                        <form onSubmit={handleChangePassword}>
                            <div className={styles.inputGroupModal}>
                                <label>Aktualne hasło</label>
                                <input
                                    type="password" required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroupModal}>
                                <label>Nowe hasło</label>
                                <input
                                    type="password" required
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroupModal}>
                                <label>Powtórz nowe hasło</label>
                                <input
                                    type="password" required
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className={styles.saveBtnFull}>Zapisz nowe hasło</button>
                        </form>
                    </div>
                </div>
            )}

            {showDeactivateModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.deactivateHeader}>
                            <FaExclamationTriangle size={40} color="#e74c3c" />
                            <h2>Czy na pewno?</h2>
                        </div>
                        <p>Deaktywacja konta jest nieodwracalna. Twój profil nie będzie widoczny dla innych.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.dangerBtnFull} onClick={handleDeactivate}>Tak, deaktywuj konto</button>
                            <button className={styles.cancelBtnFull} onClick={() => setShowDeactivateModal(false)}>Anuluj</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;