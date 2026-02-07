import { useState } from 'react';
import styles from './AddOfferPage.module.css';
import { FiType, FiAlignLeft, FiDollarSign, FiClock, FiLayers, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';

const AddOfferPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'Podstawowy',
        duration: 60,
        steps: ['']
    });
    const [image, setImage] = useState(null);

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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (response.ok) {
                alert('Oferta dodana pomyślnie!');
            } else {
                const errorData = await response.json();
                alert('Błąd: ' + errorData.message);
            }
        } catch (err) {
            console.error('Błąd wysyłania:', err);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
    };

    return (
        <div className={styles.container}>
            <h1>Dodaj nową ofertę</h1>
            <form onSubmit={handleSubmit} className={styles.form}>


                <div className={styles.inputWithIcon}>
                    <FiType className={styles.fieldIcon} />
                    <input type="text" placeholder="Tytuł oferty" required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>


                <div className={styles.inputWithIcon}>
                    <FiAlignLeft className={[styles.fieldIcon, styles.iconTop].join(' ')} />
                    <textarea placeholder="Opis oferty..." required
                        onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className={styles.row}>

                    <div className={styles.inputWithIcon}>
                        <FiDollarSign className={styles.fieldIcon} />
                        <input type="number" placeholder="Cena (PLN)" required
                            onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>

                    <div className={styles.inputWithIcon}>
                        <FiClock className={styles.fieldIcon} />
                        <input type="number" placeholder="Czas (min)" required
                            onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    </div>
                </div>


                <div className={styles.inputWithIcon}>
                    <FiLayers className={styles.fieldIcon} />
                    <select onChange={e => setFormData({ ...formData, level: e.target.value })}>
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
                    {!image ? (
                        <div className={styles.uploadPlaceholder}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setImage(e.target.files[0])}
                                id="file-upload"
                                className={styles.hiddenInput}
                            />
                            <label htmlFor="file-upload" className={styles.uploadBox}>
                                <span>+ Wybierz zdjęcie</span>
                                <small>Formaty: JPG, PNG, WEBP</small>
                            </label>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewContainer}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Podgląd"
                                className={styles.imagePreview}
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className={styles.removeImageBtn}
                            >
                                Zmień zdjęcie
                            </button>
                        </div>
                    )}
                </div>

                <button type="submit" className={styles.mainBtn}>Opublikuj ofertę</button>
            </form>
        </div>
    );
};

export default AddOfferPage;