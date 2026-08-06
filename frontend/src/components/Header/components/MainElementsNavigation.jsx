import { Link } from 'react-router-dom';
import { FiBookOpen, FiHeadphones } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import styles from './MainElementsNavigation.module.css';
import LogoSigmaSchool from '../../../assets/LogoSigmaSchool.png';

const MainElementsNavigation = () => {
    return (
        <>
            <div className={styles.headerLeft}>
                <Link to="/" className={styles.logo}><img src={LogoSigmaSchool} alt="Logo Sigma School" className={styles.logoImage} />
                </Link>
                <div className={styles.separator}></div>
            </div>

            <nav className={styles.headerCenter}>
                <Link to="/offers" className={styles.navLink}><FiBookOpen className={styles.icon} /> Oferta</Link>
                <Link to="/how-it-works" className={styles.navLink}><LuGraduationCap className={styles.icon} /> Jak to działa?</Link>
                <Link to="/contact" className={styles.navLink}><FiHeadphones className={styles.icon} /> Kontakt</Link>
            </nav>
        </>
    )
}

export default MainElementsNavigation;