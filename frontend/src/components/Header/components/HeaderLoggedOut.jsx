import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa6";
import styles from './HeaderLoggedOut.module.css';


const HeaderLoggedOut = ({ setIsModalOpen }) => {
    return (
        <>
            <button className={styles.btnLogin} onClick={() => setIsModalOpen(true)}>
                Log In
            </button>
            <Link to="/signup" className={styles.btnSignup}>
                Sign Up <FaArrowRight style={{ marginLeft: '0.5rem' }} />
            </Link>
        </>
    )
};
export default HeaderLoggedOut;