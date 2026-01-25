import styles from './Footer.module.css';
import { FaTwitter, FaGithub, FaMediumM, FaLinkedinIn, FaXing } from "react-icons/fa";


const Footer = () => {
    return (
        <footer className={styles.footer}>


            <h2 className={styles.heading}>CONTACT</h2>

            <div className={styles.separator}></div>

            <a href="mailto:info@weaintplastic.com" className={styles.email}>
                info@weaintplastic.com
            </a>

            <div className={styles.socials}>
                <a href="#" className={styles.iconLink}><FaTwitter /></a>
                <a href="#" className={styles.iconLink}><FaGithub /></a>
                <a href="#" className={styles.iconLink}><FaMediumM /></a>
                <a href="#" className={styles.iconLink}><FaLinkedinIn /></a>
                <a href="#" className={styles.iconLink}><FaXing /></a>
            </div>

            <div className={styles.imprint}>
                IMPRINT
            </div>
        </footer>
    );
};

export default Footer;