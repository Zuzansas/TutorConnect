import React, { useState } from 'react';
import styles from './HowItWorksPage.module.css';

import HeroHeader from './components/HeroHeader';
import StepsSection from './components/StepsSection';
import RulesSection from './components/RulesSection';
import CTASection from './components/CTASection';

const HowItWorksPage = () => {
    return (
        <div className={styles.container}>
            <HeroHeader />
            <StepsSection />
            <RulesSection />
            <CTASection />
        </div>
    );
};

export default HowItWorksPage;