import { useState, useEffect } from 'react';
import styles from './EditOfferPage.module.css';
import { FiType, FiAlignLeft, FiDollarSign, FiClock, FiLayers, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';

const EditOfferPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'Podstawowy',
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

    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    const addStep = () => setFormData({ ...formData, steps: [...formData.steps, ''] });

    const removeStep = (index) => {
        if (formData.steps.length > 1) {
            const newSteps = formData.steps.filter((_, i) => i !== index);
            setFormData({ ...formData, steps: newSteps });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();

        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('level', formData.level);
        data.append('durationMinutes', formData.duration);


        formData.steps.forEach(step => data.append('courseSteps', step));

        if (image) {
            data.append('image', image);
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/lesson-offers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                alert('Oferta zaktualizowana pomyślnie!');
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

    if (isLoading) return <div className={styles.container}>Ładowanie danych...</div>;

    return (
        <div className={styles.container}>
            <h1>Edytuj ofertę</h1>
            <form onSubmit={handleSubmit} className={styles.form}>

                <div className={styles.inputWithIcon}>
                    <FiType className={styles.fieldIcon} />
                    <input
                        type="text"
                        value={formData.title}
                        placeholder="Tytuł oferty"
                        required
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className={styles.inputWithIcon}>
                    <FiAlignLeft className={[styles.fieldIcon, styles.iconTop].join(' ')} />
                    <textarea
                        value={formData.description}
                        placeholder="Opis oferty..."
                        required
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.inputWithIcon}>
                        <FiDollarSign className={styles.fieldIcon} />
                        <input
                            type="number"
                            value={formData.price}
                            placeholder="Cena (PLN)"
                            required
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputWithIcon}>
                        <FiClock className={styles.fieldIcon} />
                        <input
                            type="number"
                            value={formData.duration}
                            placeholder="Czas (min)"
                            required
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.inputWithIcon}>
                    <FiLayers className={styles.fieldIcon} />
                    <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                        <option value="Podstawowy">Poziom Podstawowy</option>
                        <option value="Średni">Poziom Średniozaawansowany</option>
                        <option value="Rozszerzony">Poziom Rozszerzony/Matura</option>
                    </select>
                </div>

                <div className={styles.stepsWrapper}>
                    <h3 className={styles.sectionTitle}><FiPlus style={{ marginRight: '8px' }} /> Kroki współpracy</h3>
                    <div className={styles.stepsSection}>
                        <div className={styles.stepsList}>
                            {formData.steps.map((step, index) => (
                                <div key={index} className={styles.stepInputWrapper}>
                                    <span className={styles.stepNumber}>{index + 1}</span>
                                    <input
                                        value={step}
                                        placeholder="Opisz ten krok..."
                                        onChange={e => handleStepChange(index, e.target.value)}
                                        required
                                    />
                                    {formData.steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(index)} className={styles.removeStepBtn}>
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addStep} className={styles.addStepBtn}>
                            + Dodaj kolejny krok
                        </button>
                    </div>
                </div>


                <div className={styles.fileInputSection}>
                    <label className={styles.fileLabel}><FiImage style={{ marginRight: '8px' }} /> Zdjęcie oferty</label>
                    {!image && !currentImageUrl ? (
                        <div className={styles.uploadPlaceholder}>
                            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} id="file-upload" className={styles.hiddenInput} />
                            <label htmlFor="file-upload" className={styles.uploadBox}>
                                <span>+ Wybierz zdjęcie</span>
                            </label>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewContainer}>
                            <img
                                src={image ? URL.createObjectURL(image) : currentImageUrl}
                                alt="Podgląd"
                                className={styles.imagePreview}
                            />
                            <button type="button" onClick={() => { setImage(null); setCurrentImageUrl(''); }} className={styles.removeImageBtn}>
                                Zmień zdjęcie
                            </button>
                        </div>
                    )}
                </div>

                <button type="submit" className={styles.mainBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'Aktualizowanie...' : 'Zapisz zmiany'}
                </button>
            </form>
        </div>
    );
};

export default EditOfferPage;