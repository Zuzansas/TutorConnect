import { useState } from 'react';
import styles from './Header.module.css';
import { Link } from 'react-router-dom';
import LoginModal from '../LoginModal/LoginModal';
import { FiBookOpen, FiHeadphones } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa6";

const Header = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <span className={styles.logo}>LOGO</span>
                <div className={styles.separator}></div>
            </div>

            <nav className={styles.headerCenter}>
                <a href="#classes" className={styles.navLink}><FiBookOpen className={styles.icon} /> Oferta</a>
                <a href="#teaching" className={styles.navLink}><LuGraduationCap className={styles.icon} /> Jak to działa?</a>
                <a href="#support" className={styles.navLink}><FiHeadphones className={styles.icon} /> Kontakt</a>
            </nav>

            <div className={styles.headerRight}>
                <button className={styles.btnLogin} onClick={() => setIsModalOpen(true)}>
                    Log In
                </button>
                <Link to="/signup" className={styles.btnSignup}>
                    Sign Up <FaArrowRight style={{ marginLeft: '8px' }} />
                </Link>
            </div>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};

export default Header;