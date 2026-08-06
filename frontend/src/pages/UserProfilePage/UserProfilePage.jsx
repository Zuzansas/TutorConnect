import React, { useState, useEffect } from 'react';
import styles from './UserProfilePage.module.css';
import { City } from 'country-state-city';
import { toast, ToastContainer } from 'react-toastify'; // <--- IMPORT
import 'react-toastify/dist/ReactToastify.css';

import ProfileHeader from './components/ProfileHeader';
import PersonalInfoSection from './components/PersonalInfoSection';
import LocationSection from './components/LocationSection';
import SecuritySection from './components/SecuritySection';
import PasswordModal from './components/PasswordModal';
import DeactivateModal from './components/DeactivateModal';

const UserProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            toast.error("Błąd pobierania profilu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Nowe hasła nie są identyczne!');
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
                toast.success('Hasło zostało zmienione!');
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(result.message || 'Błąd zmiany hasła.');
            }
        } catch (error) {
            toast.error('Błąd połączenia z serwerem.');
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
            toast.error('Nie udało się deaktywować konta.');
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
            if (response.ok) {
                fetchProfile();
                setIsEditingLocation(false);
                toast.success('Lokalizacja zaktualizowana!');
            }
        } catch (error) {
            toast.error('Błąd lokalizacji.');
        }
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
            if (response.ok) {
                toast.success('Avatar zaktualizowany!');
                fetchProfile();
            }
        } catch (error) {
            toast.error('Błąd wgrywania zdjęcia.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/users/me', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });
            if (response.ok) {
                toast.success('Profil zaktualizowany!');
                setIsEditing(false);
                fetchProfile();
            }
        } catch (error) {
            toast.error('Błąd profilu.');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/me/avatar', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Zdjęcie profilowe zostało usunięte!');
                fetchProfile();
            } else {
                toast.error('Błąd podczas usuwania zdjęcia.');
            }
        } catch (error) {
            toast.error('Błąd połączenia z serwerem.');
        }
    };

    if (isLoading) return <div className={styles.loader}>Pobieranie danych profilu...</div>;

    return (
        <div className={styles.container}>
            {/* KONTENER DLA TOASTÓW Z PASIEM POSTĘPU */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
            />

            <div className={styles.profileWrapper}>
                <div className={styles.profileGrid}>
                    <div className={styles.leftColumn}>
                        <ProfileHeader
                            userData={userData}
                            handleAvatarUpdate={handleAvatarUpdate}
                            handleRemoveAvatar={handleRemoveAvatar}
                        />
                    </div>

                    <div className={styles.rightColumn}>
                        <PersonalInfoSection
                            userData={userData}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            profileForm={profileForm}
                            setProfileForm={setProfileForm}
                            handleUpdateProfile={handleUpdateProfile}
                        />

                        <LocationSection
                            userData={userData}
                            isEditingLocation={isEditingLocation}
                            setIsEditingLocation={setIsEditingLocation}
                            cityQuery={cityQuery}
                            handleCityChange={handleCityChange}
                            handleSaveCity={handleSaveCity}
                            showSuggestions={showSuggestions}
                            filteredCities={filteredCities}
                            selectCity={selectCity}
                        />

                        <SecuritySection
                            setShowPasswordModal={setShowPasswordModal}
                            setShowDeactivateModal={setShowDeactivateModal}
                        />
                    </div>
                </div>
            </div>

            <PasswordModal
                showPasswordModal={showPasswordModal}
                setShowPasswordModal={setShowPasswordModal}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                handleChangePassword={handleChangePassword}
            />

            <DeactivateModal
                showDeactivateModal={showDeactivateModal}
                setShowDeactivateModal={setShowDeactivateModal}
                handleDeactivate={handleDeactivate}
            />
        </div>
    );
};

export default UserProfilePage;