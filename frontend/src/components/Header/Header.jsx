import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import LoginModal from '../LoginModal/LoginModal';
import MainElementsNavigation from './components/MainElementsNavigation';
import HeaderLoggedIn from './components/HeaderLoggedIn';
import HeaderLoggedOut from './components/HeaderLoggedOut';

const Header = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
        navigate('/');
    };

    return (
        <header className={styles.header}>
            <MainElementsNavigation />
            <div className={styles.headerRight}>
                {isLoggedIn ? (
                    <HeaderLoggedIn
                        setIsDropdownOpen={setIsDropdownOpen}
                        isDropdownOpen={isDropdownOpen}
                        handleLogout={handleLogout}
                    />
                ) : (
                    <HeaderLoggedOut setIsModalOpen={setIsModalOpen} />
                )}
            </div>

            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};

export default Header;