import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiType, FiAlignLeft, FiDollarSign, FiClock, FiLayers, FiUsers } from 'react-icons/fi';
import { HiNumberedList } from "react-icons/hi2";
import styles from '../../components/AddEditOffer/MainForm.module.css';

import FormField from '../../components/AddEditOffer/FormField';
import StepsSection from '../../components/AddEditOffer/StepsSection';
import ImageUpload from '../../components/AddEditOffer/ImageUpload';

const EditOfferPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'Podstawowy',
        lessonType: 'INDIVIDUAL', // <--- NOWE FIELD
        totalLessons: 4,          // <--- NOWE FIELD
        duration: 60,
        steps: ['']
    });
    const [image, setImage] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOfferData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/lesson-offers/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        level: data.level,
                        lessonType: data.lessonType || 'INDIVIDUAL', // <--- POBIERANIE Z BACKENDU
                        totalLessons: data.totalLessons || 4,         // <--- POBIERANIE Z BACKENDU
                        duration: data.durationMinutes,
                        steps: data.courseSteps || ['']
                    });
                    setCurrentImageUrl(data.imageUrl);
                }
            } catch (err) {
                console.error("Błąd pobierania danych:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOfferData();
    }, [id]);

    const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        handleInputChange('steps', newSteps);
    };

    const addStep = () => handleInputChange('steps', [...formData.steps, '']);
    const removeStep = (index) => handleInputChange('steps', formData.steps.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('level', formData.level);
        data.append('lessonType', formData.lessonType);       // <--- WYSYŁANIE DO BACKENDU
        data.append('totalLessons', formData.totalLessons);   // <--- WYSYŁANIE DO BACKENDU
        data.append('durationMinutes', formData.duration);
        formData.steps.forEach(step => data.append('courseSteps', step));
        if (image) data.append('image', image);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/lesson-offers/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                alert('Oferta zaktualizowana pomyślnie!');
                navigate('/offers');
            } else {
                const errorData = await response.json();
                alert('Błąd: ' + (errorData.message || 'Nie udało się zaktualizować oferty'));
            }
        } catch (err) {
            console.error('Błąd wysyłania:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className={styles.container}>Ładowanie danych...</div>;

    return (
        <div className={styles.container}>
            <h1>Edytuj ofertę</h1>
            <form onSubmit={handleSubmit} className={styles.form}>

                <FormField icon={FiType}>
                    <input
                        type="text" value={formData.title} placeholder="Tytuł oferty" required
                        onChange={e => handleInputChange('title', e.target.value)}
                    />
                </FormField>

                <FormField icon={FiAlignLeft} className={styles.iconTop}>
                    <textarea
                        value={formData.description} placeholder="Opis oferty..." required
                        onChange={e => handleInputChange('description', e.target.value)}
                    />
                </FormField>

                <div className={styles.row}>
                    <FormField icon={FiDollarSign}>
                        <input
                            type="number" value={formData.price} placeholder="Cena (PLN)" required
                            onChange={e => handleInputChange('price', e.target.value)}
                        />
                    </FormField>
                    <FormField icon={FiClock}>
                        <input
                            type="number" value={formData.duration} placeholder="Czas 1 lekcji (min)" required
                            onChange={e => handleInputChange('duration', e.target.value)}
                        />
                    </FormField>
                    {/* DODANE POLE: ILOŚĆ LEKCJI W PAKIECIE */}
                    <FormField icon={HiNumberedList}>
                        <input
                            type="number" value={formData.totalLessons} placeholder="Ilość lekcji w pakiecie" required
                            onChange={e => handleInputChange('totalLessons', e.target.value)}
                        />
                    </FormField>
                </div>

                <div className={styles.rowTwo}>
                    <FormField icon={FiLayers}>
                        <select value={formData.level} onChange={e => handleInputChange('level', e.target.value)}>
                            <option value="Podstawowy">Poziom Podstawowy</option>
                            <option value="Średni">Poziom Średniozaawansowany</option>
                            <option value="Rozszerzony">Poziom Rozszerzony/Matura</option>
                        </select>
                    </FormField>

                    <FormField icon={FiUsers}>
                        <select value={formData.lessonType} onChange={e => handleInputChange('lessonType', e.target.value)}>
                            <option value="INDYWIDUALNE">Lekcje Indywidualne</option>
                            <option value="GRUPOWE">Lekcje Grupowe</option>
                        </select>
                    </FormField>
                </div>

                <StepsSection
                    steps={formData.steps}
                    onStepChange={handleStepChange}
                    onAddStep={addStep}
                    onRemoveStep={removeStep}
                />

                <ImageUpload
                    image={image}
                    currentImageUrl={currentImageUrl}
                    onImageChange={setImage}
                    onRemoveImage={() => { setImage(null); setCurrentImageUrl(''); }}
                />

                <button type="submit" className={styles.mainBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'Aktualizowanie...' : 'Zapisz zmiany'}
                </button>
            </form>
        </div>
    );
};

export default EditOfferPage;