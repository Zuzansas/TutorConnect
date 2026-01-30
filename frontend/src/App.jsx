import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FeatureSection from './components/FeatureSection/FeatureSection';
import SignupPage from './pages/SignupPage/SignupPage';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <Routes>
          <Route path="/" element={<FeatureSection />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;