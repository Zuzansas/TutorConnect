import { useState } from 'react';
import styles from './SignupPage.module.css';
import { FaUser, FaLock, FaMapMarkerAlt, FaCheckCircle, FaEnvelope, FaBook, FaArrowLeft, FaCamera } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import ImageUpload from './components/ImageUpload';
import { City } from 'country-state-city';

const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

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

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);
    const allPolishCities = City.getCitiesOfCountry('PL').map(c => c.name);
    const handleCityChange = (e) => {
        const value = e.target.value;
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
        setCityQuery(city);
        setFormData(prev => ({ ...prev, city: city }));
        setShowSuggestions(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleRegister = async () => {

        if (formData.password !== formData.repeatedPassword) {
            setErrorMessage("Hasła nie są identyczne!");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');


        const payload = new FormData();


        const jsonRequest = JSON.stringify({
            fullName: formData.fullName,
            username: formData.email,
            email: formData.email,
            password: formData.password,
            repeatedPassword: formData.repeatedPassword,
            city: formData.city,
            bio: formData.bio
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

            if (response.ok) {
                nextStep();
            } else {
                setErrorMessage(result.message || 'Błąd rejestracji. Sprawdź dane.');
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
                    <div className={styles.stepContainer}>
                        <h3>Dane konta</h3>
                        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
                        <div className={styles.inputGroup}>
                            <FaUser className={styles.inputIcon} />
                            <input name="fullName" type="text" placeholder="Imię i nazwisko" value={formData.fullName} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <FaEnvelope className={styles.inputIcon} />
                            <input name="email" type="email" placeholder="Adres e-mail" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <FaLock className={styles.inputIcon} />
                            <input name="password" type="password" placeholder="Hasło (min. 8 znaków)" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <FaLock className={styles.inputIcon} />
                            <input name="repeatedPassword" type="password" placeholder="Powtórz hasło" value={formData.repeatedPassword} onChange={handleChange} required />
                        </div>
                        <button className={styles.mainBtn} onClick={nextStep}>Dalej</button>
                    </div>
                );
            case 2:
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
                        <div className={styles.inputGroup}>
                            <FaUser className={styles.inputIcon} />
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Imię i nazwisko"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        <div className={styles.inputGroup} style={{ position: 'relative' }}>
                            <FaMapMarkerAlt className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Wybierz miasto..."
                                value={cityQuery}
                                onChange={handleCityChange}
                                onFocus={() => cityQuery.length > 1 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />

                            {showSuggestions && filteredCities.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {filteredCities.map((city, index) => (
                                        <li key={index} onClick={() => selectCity(city)}>
                                            {city}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>





                        <div className={styles.inputGroup}>
                            <FaBook className={styles.textareaIcon} style={{ color: '#bdc3c7' }} />
                            <textarea
                                name="bio"
                                placeholder="Opowiedz coś o sobie (Bio)..."
                                className={styles.textarea}
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.btnRow}>
                            <button className={styles.mainBtn} onClick={handleRegister} disabled={isLoading}>
                                {isLoading ? 'Przetwarzanie...' : 'Zakończ rejestrację'}
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.stepContainer + ' ' + styles.center}>
                        <FaCheckCircle className={styles.successIcon} />
                        <h3>Gotowe!</h3>
                        <p>Twoje konto zostało utworzone. Możesz teraz przejść do logowania.</p>
                        <button className={styles.mainBtn} onClick={() => navigate('/')}>Przejdź do logowania</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.signupCard}>
                <FaArrowLeft className={styles.backIcon} onClick={prevStep} style={{ visibility: (step === 1 || step === 3) ? 'hidden' : 'visible', color: '#bdc3c7' }} />
                <div className={styles.progressTracker}>
                    {[1, 2, 3].map((s, i) => (
                        <span key={s} style={{ display: 'contents' }}>
                            <div className={`${styles.dot} ${step >= s ? styles.active : ''}`}></div>
                            {i < 2 && <div className={`${styles.line} ${step > s ? styles.active : ''}`}></div>}
                        </span>
                    ))}
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default SignupPage;