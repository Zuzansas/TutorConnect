import React from 'react';
import StepCard from './StepCard';
import styles from '../HowItWorksPage.module.css';
import {
    FaSearch,
    FaShoppingBag,
    FaCalendarCheck,
    FaGraduationCap
} from 'react-icons/fa';

const STUDENT_STEPS = [
    {
        number: '01',
        icon: FaSearch,
        title: 'Wybierz Ofertę',
        description: 'Przeglądaj bogaty katalog lekcji. Filtruj zajęcia według przedmiotu, poziomu zaawansowania (Podstawowy, Średni, Rozszerzony) oraz typu (Indywidualne lub Grupowe).'
    },
    {
        number: '02',
        icon: FaShoppingBag,
        title: 'Kup Pakiet Lekcji',
        description: 'Wybierz dopasowany pakiet (np. 4 lub 8 lekcji) i dokonaj zakupu. Twój pakiet trafi od razu do zakładki "Moje Konto Lekcji".'
    },
    {
        number: '03',
        icon: FaCalendarCheck,
        title: 'Rezerwuj Terminy',
        description: 'Przejdź do kalendarza w dogodnej chwili. System sam wyświetli i dopasuje tylko te sloty, które odpowiadają Twojemu pakietowi.'
    },
    {
        number: '04',
        icon: FaGraduationCap,
        title: 'Ucz się i Pobieraj Materiały',
        description: 'Bierz udział w zajęciach! Po zakończonych lekcjach pobieraj notatki, pliki PDF i zadania domowe udostępnione przez korepetytora.'
    }
];

const StepsSection = () => {
    return (
        <section className={styles.stepsSection}>
            <h2 className={styles.sectionTitle}>
                Ścieżka Ucznia – <span>4 proste kroki do wiedzy</span>
            </h2>
            <div className={styles.stepsGrid}>
                {STUDENT_STEPS.map((step, index) => (
                    <StepCard
                        key={step.number}
                        number={step.number}
                        icon={step.icon}
                        title={step.title}
                        description={step.description}
                        delay={index * 0.15}
                    />
                ))}
            </div>
        </section>
    );
};

export default StepsSection;