import { FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from './StepsSection.module.css';

const StepsSection = ({ steps, onStepChange, onAddStep, onRemoveStep }) => (
    <div className={styles.stepsWrapper}>
        <h3 className={styles.sectionTitle}>
            <FiPlus style={{ marginRight: '8px' }} /> Kroki współpracy
        </h3>
        <div className={styles.stepsSection}>
            <div className={styles.stepsList}>
                {steps.map((step, index) => (
                    <div key={index} className={styles.stepInputWrapper}>
                        <span className={styles.stepNumber}>{index + 1}</span>
                        <input
                            value={step}
                            placeholder="Opisz ten krok..."
                            onChange={(e) => onStepChange(index, e.target.value)}
                            required
                        />
                        {steps.length > 1 && (
                            <button type="button" onClick={() => onRemoveStep(index)} className={styles.removeStepBtn}>
                                <FiTrash2 />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={onAddStep} className={styles.addStepBtn}>
                + Dodaj kolejny krok
            </button>
        </div>
    </div>
);

export default StepsSection;