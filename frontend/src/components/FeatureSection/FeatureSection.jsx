import styles from './FeatureSection.module.css';
import { motion } from 'framer-motion';
import { featuresData } from './const/const';

const FeatureSection = () => {

    const textAnimation = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const imageAnimation = (isReversed) => ({
        hidden: { opacity: 0, x: isReversed ? 100 : -100 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } }
    });


    return (
        <section className={styles.container}>
            {featuresData.map((item) => (
                <div key={item.id} className={`${styles.row} ${item.reversed ? styles.reversed : ''}`}>

                    <motion.div
                        className={styles.textBlock}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={textAnimation}
                    >
                        <h2 className={styles.title}>{item.title}</h2>
                        <p className={styles.description}>{item.description}</p>
                    </motion.div>
                    <motion.div
                        className={styles.imageBlock}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={imageAnimation(item.reversed)}
                    >
                        <img src={item.imageSrc} alt={item.title} className={styles.image} />
                    </motion.div>

                </div>
            ))}
        </section>
    );
};

export default FeatureSection;