import { FiImage } from 'react-icons/fi';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ image, currentImageUrl, onImageChange, onRemoveImage }) => (
    <div className={styles.fileInputSection}>
        <label className={styles.fileLabel}>
            <FiImage style={{ marginRight: '8px' }} /> Zdjęcie oferty
        </label>
        {!image && !currentImageUrl ? (
            <div className={styles.uploadPlaceholder}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageChange(e.target.files[0])}
                    id="file-upload"
                    className={styles.hiddenInput}
                />
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
                <button type="button" onClick={onRemoveImage} className={styles.removeImageBtn}>
                    Zmień zdjęcie
                </button>
            </div>
        )}
    </div>
);

export default ImageUpload;