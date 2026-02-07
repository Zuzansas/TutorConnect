import { FaChevronDown, FaPlus } from "react-icons/fa6"
import { FiUser, FiSettings, FiLogOut, FiCalendar } from "react-icons/fi";
import { Link } from 'react-router-dom';
import styles from './HeaderLoggedIn.module.css';


const HeaderLoggedIn = ({ setIsDropdownOpen, isDropdownOpen, handleLogout, isAdmin }) => {
    return (
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
                    <Link to="/reservations" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                        <FiCalendar /> Moje Rezerwacje
                    </Link>
                    {isAdmin && (
                        <>
                            <div className={styles.dropdownDivider}></div>
                            <Link to="/add-offer" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                <FaPlus /> Dodaj Ofertę
                            </Link>
                            <Link to="/admin-calendar" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                                <FiSettings /> Kalendarz
                            </Link>
                        </>
                    )}
                    <div className={styles.dropdownDivider}></div>
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                        <FiLogOut /> Wyloguj się
                    </button>
                </div>
            )}
        </div>
    )
}

export default HeaderLoggedIn;