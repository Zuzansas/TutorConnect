import React from 'react';
import styles from '../UserProfilePage.module.css';
import ImageUpload from '../../SignupPage/components/ImageUpload';

const ProfileHeader = ({ userData, handleAvatarUpdate, handleRemoveAvatar }) => {
    return (
        <div className={styles.headerCard}>
            <div className={styles.avatarWrapper}>
                <ImageUpload
                    image={null}
                    currentImageUrl={userData?.avatarUrl}
                    onImageChange={handleAvatarUpdate}
                    onRemoveImage={handleRemoveAvatar}
                />
            </div>
            <h1 className={styles.fullName}>{userData?.fullName}</h1>
            <p className={styles.username}>@{userData?.email?.split('@')[0]}</p>

        </div>
    );
};

export default ProfileHeader;