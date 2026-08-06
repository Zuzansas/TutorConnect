import React from 'react';
import styles from '../HowItWorksPage.module.css';
import { FaCheckCircle } from 'react-icons/fa';

const RULES = [
    {
        title: 'Rezerwacja z wyprzedzeniem (24h)',
        description: 'Aby korepetytor mógł się przygotować, rezerwacji slota w kalendarzu można dokonać najpóźniej 24 godziny przed lekcją.'
    },
    {
        title: 'Jasne zasady odwoływania (12h)',
        description: 'Lekcję można odwołać bezpłatnie do 12 godzin przed jej rozpoczęciem – wtedy 1 lekcja wraca do Twojego pakietu.'
    },
    {
        title: 'Bezpieczne Pakiety Lekcji',
        description: 'Kupujesz pakiet raz, a terminy w kalendarzu dobierasz wtedy, kiedy masz na to czas w trakcie trwania pakietu.'
    }
];

const RulesSection = () => {
    return (
        <section className={styles.rulesSection}>
            <h2>Główne zasady korzystania z serwisu</h2>
            <div className={styles.rulesGrid}>
                {RULES.map((rule, idx) => (
                    <div key={idx} className={styles.ruleBox}>
                        <FaCheckCircle className={styles.checkIcon} />
                        <div>
                            <h4>{rule.title}</h4>
                            <p>{rule.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RulesSection;