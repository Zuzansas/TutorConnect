import styles from './App.module.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FeatureSection from './components/FeatureSection/FeatureSection';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <FeatureSection />
      <Footer />
    </div>
  );
}

export default App;
