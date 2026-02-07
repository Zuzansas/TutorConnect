import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiType, FiAlignLeft, FiDollarSign, FiClock, FiLayers } from 'react-icons/fi';
import styles from '../../components/AddEditOffer/MainForm.module.css';


import FormField from '../../components/AddEditOffer/FormField';
import StepsSection from '../../components/AddEditOffer/StepsSection';
import ImageUpload from '../../components/AddEditOffer/ImageUpload';

const AddOfferPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'Podstawowy',
        duration: 60,
        steps: ['']
    });
    const [image, setImage] = useState(null);


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
        data.append('duration', formData.duration);
        formData.steps.forEach(step => data.append('steps', step));
        if (image) data.append('image', image);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8080/api/lesson-offers', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                alert('Oferta dodana pomyślnie!');
                navigate('/offers');
            } else {
                const errorData = await response.json();
                alert('Błąd: ' + errorData.message);
            }
        } catch (err) {
            console.error('Błąd wysyłania:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Dodaj nową ofertę</h1>
            <form onSubmit={handleSubmit} className={styles.form}>

                <FormField icon={FiType}>
                    <input
                        type="text" placeholder="Tytuł oferty" required
                        onChange={e => handleInputChange('title', e.target.value)}
                    />
                </FormField>

                <FormField icon={FiAlignLeft} className={styles.iconTop}>
                    <textarea
                        placeholder="Opis oferty..." required
                        onChange={e => handleInputChange('description', e.target.value)}
                    />
                </FormField>

                <div className={styles.row}>
                    <FormField icon={FiDollarSign}>
                        <input
                            type="number" placeholder="Cena (PLN)" required
                            onChange={e => handleInputChange('price', e.target.value)}
                        />
                    </FormField>
                    <FormField icon={FiClock}>
                        <input
                            type="number" placeholder="Czas (min)" required
                            onChange={e => handleInputChange('duration', e.target.value)}
                        />
                    </FormField>
                </div>

                <FormField icon={FiLayers}>
                    <select onChange={e => handleInputChange('level', e.target.value)}>
                        <option value="Podstawowy">Poziom Podstawowy</option>
                        <option value="Średni">Poziom Średniozaawansowany</option>
                        <option value="Rozszerzony">Poziom Rozszerzony/Matura</option>
                    </select>
                </FormField>

                <StepsSection
                    steps={formData.steps}
                    onStepChange={handleStepChange}
                    onAddStep={addStep}
                    onRemoveStep={removeStep}
                />

                <ImageUpload
                    image={null}
                    onImageChange={setImage}
                    onRemoveImage={() => setImage(null)}
                />

                <button type="submit" className={styles.mainBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'Publikowanie...' : 'Opublikuj ofertę'}
                </button>
            </form>
        </div>
    );
};

export default AddOfferPage;