import React, { useState } from 'react';
import styles from './SignupPage.module.css';
import { useNavigate } from 'react-router-dom';
import { City } from 'country-state-city';
import { sanitizeInput } from './utils/sanitize';

import ProgressTracker from './components/ProgressTracker';
import AccountDataStep from './components/AccountDataStep';
import ProfileDetailsStep from './components/ProfileDetailsStep';
import SuccessStep from './components/SuccessStep';

const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [errors, setErrors] = useState({});

    const [cityQuery, setCityQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        repeatedPassword: '',
        city: '',
        bio: '',
        avatarUrl: ''
    });

    const allPolishCities = City.getCitiesOfCountry('PL').map(c => c.name);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validateStep = () => {
        let newErrors = {};

        if (step === 1) {
            if (!formData.fullName.trim()) {
                newErrors.fullName = "Imię i nazwisko jest wymagane";
            }
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = "Podaj poprawny adres e-mail";
            }
            if (formData.password.length < 8) {
                newErrors.password = "Hasło musi mieć min. 8 znaków";
            }
            if (formData.password !== formData.repeatedPassword) {
                newErrors.repeatedPassword = "Hasła nie są identyczne";
            }
        }

        if (step === 2) {
            if (!formData.fullName.trim()) {
                newErrors.fullName = "Imię i nazwisko jest wymagane";
            }
            if (formData.bio && formData.bio.length > 500) {
                newErrors.bio = "Bio może mieć max 500 znaków";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep()) {
            nextStep();
        }
    };

    const handleCityChange = (e) => {
        const value = sanitizeInput(e.target.value);
        setCityQuery(value);
        setFormData(prev => ({ ...prev, city: value }));

        if (value.length >= 2) {
            const filtered = allPolishCities
                .filter(city => city.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 10);

            setFilteredCities(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectCity = (city) => {
        const cleanCity = sanitizeInput(city);
        setCityQuery(cleanCity);
        setFormData(prev => ({ ...prev, city: cleanCity }));
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = name.includes('password') || name.includes('Password')
            ? value
            : sanitizeInput(value);

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFinish = () => {
        navigate('/');
    };

    const handleRegister = async () => {
        if (!validateStep()) return;

        setIsLoading(true);
        setErrorMessage('');

        const payload = new FormData();

        const jsonRequest = JSON.stringify({
            fullName: sanitizeInput(formData.fullName),
            username: sanitizeInput(formData.email),
            email: sanitizeInput(formData.email),
            password: formData.password,
            repeatedPassword: formData.repeatedPassword,
            city: sanitizeInput(formData.city),
            bio: sanitizeInput(formData.bio)
        });

        payload.append('request', new Blob([jsonRequest], { type: 'application/json' }));

        if (avatarFile) {
            payload.append('avatar', avatarFile);
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                body: payload,
            });
            const result = await response.json();

            if (!response.ok) {
                if (result.message && result.message.includes("e-mail")) {
                    setErrors({ email: "Ten adres e-mail jest już zajęty" });
                    setStep(1);
                } else {
                    setErrorMessage(result.message || "Błąd rejestracji");
                }
            } else {

                setStep(3);
                setTimeout(() => {
                    navigate('/');
                }, 5000);
            }
        } catch (error) {
            setErrorMessage('Błąd połączenia z serwerem. Upewnij się, że Backend działa.');
            console.error("Szczegóły błędu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <AccountDataStep
                        formData={formData}
                        handleChange={handleChange}
                        errors={errors}
                        handleNextStep={handleNextStep}
                    />
                );
            case 2:
                return (
                    <ProfileDetailsStep
                        formData={formData}
                        handleChange={handleChange}
                        avatarFile={avatarFile}
                        setAvatarFile={setAvatarFile}
                        cityQuery={cityQuery}
                        handleCityChange={handleCityChange}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        filteredCities={filteredCities}
                        selectCity={selectCity}
                        handleRegister={handleRegister}
                        isLoading={isLoading}
                        errors={errors}
                    />
                );
            case 3:
                return <SuccessStep onFinish={handleFinish} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.signupCard}>
                <ProgressTracker step={step} prevStep={prevStep} />

                {errorMessage && (
                    <div className={styles.serverErrorAlert}>
                        {errorMessage}
                    </div>
                )}

                {renderStep()}
            </div>
        </div>
    );
};

export default SignupPage;