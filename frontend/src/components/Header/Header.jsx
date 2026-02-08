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

    const [isAdmin, setIsAdmin] = useState(false);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');
        setIsLoggedIn(!!token);
        setIsAdmin(role === 'ADMIN');
    };

    useEffect(() => {

        checkAuth();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.clear();

        window.location.href = '/';
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
                        isAdmin={isAdmin}
                    />
                ) : (
                    <HeaderLoggedOut setIsModalOpen={setIsModalOpen} />
                )}
            </div>

            <LoginModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); checkAuth(); }} />
        </header>
    );
};

export default Header;