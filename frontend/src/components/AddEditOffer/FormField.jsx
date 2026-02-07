import styles from './FormField.module.css';

const FormField = ({ icon: Icon, children, className }) => (
    <div className={`${styles.inputWithIcon} ${className}`}>
        {Icon && <Icon className={styles.fieldIcon} />}
        {children}
    </div>
);

export default FormField;