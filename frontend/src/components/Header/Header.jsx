import styles from './Header.module.css';

import { FiBookOpen, FiHeadphones } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa6";

const Header = () => {
    return (

        <header className={styles.header}>

            <div className={styles.headerLeft}>
                <span className={styles.logo}>LOGO</span>
                <div className={styles.separator}></div>
            </div>

            <nav className={styles.headerCenter}>
                <a href="#classes" className={styles.navLink}>
                    <FiBookOpen className={styles.icon} /> Oferta
                </a>
                <a href="#teaching" className={styles.navLink}>
                    <LuGraduationCap className={styles.icon} /> Jak to działa?
                </a>
                <a href="#support" className={styles.navLink}>
                    <FiHeadphones className={styles.icon} /> Kontakt
                </a>
            </nav>

            <div className={styles.headerRight}>
                <button className={styles.btnLogin}>Log In</button>
                <button className={styles.btnSignup}>
                    Sign Up <FaArrowRight style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </header>
    );
};

export default Header;