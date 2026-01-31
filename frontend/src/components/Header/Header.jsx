import { useState, useEffect } from 'react'; // Dodajemy useEffect
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import LoginModal from '../LoginModal/LoginModal';
import { FiBookOpen, FiHeadphones, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
import LogoSigmaSchool from '../../assets/LogoSigmaSchool.png';

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
            <div className={styles.headerLeft}>
                <Link to="/" className={styles.logo}><img src={LogoSigmaSchool} alt="Logo Sigma School" className={styles.logoImage} />
                </Link>
                <div className={styles.separator}></div>
            </div>

            <nav className={styles.headerCenter}>
                <Link to="/offers" className={styles.navLink}><FiBookOpen className={styles.icon} /> Oferta</Link>
                <a href="#teaching" className={styles.navLink}><LuGraduationCap className={styles.icon} /> Jak to działa?</a>
                <a href="#support" className={styles.navLink}><FiHeadphones className={styles.icon} /> Kontakt</a>
            </nav>

            <div className={styles.headerRight}>
                {isLoggedIn ? (
                    <div className={styles.userMenuContainer}>
                        <button
                            className={styles.userMenuBtn}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <FiUser className={styles.icon} />
                            Moje konto
                            <FaChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotate : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                    <FiUser /> Mój Profil
                                </Link>
                                <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                    <FiSettings /> Ustawienia
                                </Link>
                                <div className={styles.dropdownDivider}></div>
                                <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                                    <FiLogOut /> Wyloguj się
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button className={styles.btnLogin} onClick={() => setIsModalOpen(true)}>
                            Log In
                        </button>
                        <Link to="/signup" className={styles.btnSignup}>
                            Sign Up <FaArrowRight style={{ marginLeft: '8px' }} />
                        </Link>
                    </>
                )}
            </div>

            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};

export default Header;