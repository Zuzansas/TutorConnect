import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiImage, FiCheck, FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import styles from './ImageUpload.module.css';

const ImageUpload = ({ image, currentImageUrl, onImageChange, onRemoveImage }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);


    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };


    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = makeAspectCrop({ unit: '%', width: 90 }, 1, width, height);
        setCrop(centerCrop(initialCrop, width, height));
    };

    const getCroppedImg = async () => {
        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const pixelCrop = convertToPixelCrop(completedCrop, image.width, image.height);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            onImageChange(file);
            setImgSrc('');
        }, 'image/jpeg');
    };

    return (
        <div className={styles.fileInputSection}>

            {!image && !currentImageUrl && !imgSrc && (
                <div className={styles.uploadPlaceholder}>
                    <input type="file" accept="image/*" onChange={onSelectFile} id="file-upload" className={styles.hiddenInput} />
                    <label htmlFor="file-upload" className={styles.uploadBox}>
                        <FiImage size={24} />
                        <span>+ Dodaj awatar</span>
                    </label>
                </div>
            )}

            {imgSrc && (
                <div className={styles.cropOverlay}>
                    <div className={styles.cropContainer}>
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} />
                        </ReactCrop>
                        <div className={styles.cropActions}>
                            <button onClick={() => setImgSrc('')} className={styles.cancelBtn}><FiX /> Anuluj</button>
                            <button onClick={getCroppedImg} className={styles.confirmBtn}><FiCheck /> Przytnij</button>
                        </div>
                    </div>
                </div>
            )}


            {(image || currentImageUrl) && !imgSrc && (
                <div className={styles.previewWrapper}>
                    <div className={styles.avatarPreviewContainer}>
                        <img
                            src={image ? URL.createObjectURL(image) : currentImageUrl}
                            alt="Podgląd"
                            className={styles.avatarCircle}
                        />
                    </div>
                    <div className={styles.actionButtons}>
                        <label htmlFor="file-upload" className={styles.changeBtn}>
                            <FiRefreshCw /> Zmień
                            <input type="file" accept="image/*" onChange={onSelectFile} id="file-upload" className={styles.hiddenInput} />
                        </label>
                        <button type="button" onClick={onRemoveImage} className={styles.removeBtn}>
                            <FiTrash2 /> Usuń
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;