import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FeatureSection from './components/FeatureSection/FeatureSection';
import SignupPage from './pages/SignupPage/SignupPage';
import OffersPage from './pages/OffersPage/OffersPage';
import OfferDetailsPage from './pages/OfferDetailsPage/OfferDetailsPage';
import AddOfferPage from './pages/AddOfferPage/AddOfferPage';
import EditOfferPage from './pages/EditOfferPage/EditOfferPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <Routes>
          <Route path="/" element={<FeatureSection />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offer/:id" element={<OfferDetailsPage />} />
          <Route path="/add-offer" element={<AddOfferPage />} />
          <Route path="/edit-offer/:id" element={<ProtectedRoute><EditOfferPage /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;