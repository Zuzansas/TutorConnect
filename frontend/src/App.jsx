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
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import AdminCalendarPage from './pages/AdminCalendarPage/AdminCalendarPage';
import BookingPage from './pages/BookingPage/BookingPage';
import ReservationsPage from './pages/ReservationsPage/ReservationsPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage/HowItWorksPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage.jsx';
import ActivateAccountPage from './components/ActivateAccountPage/ActivateAccountPage.jsx';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Header />
        <Routes>
          <Route path="/" element={<FeatureSection />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/offer/:id" element={<OfferDetailsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/add-offer" element={<AddOfferPage />} />
          <Route path="/edit-offer/:id" element={<ProtectedRoute><EditOfferPage /></ProtectedRoute>} />
          <Route path='/admin-calendar' element={<ProtectedRoute><AdminCalendarPage /></ProtectedRoute>} />
          <Route path="/book/:packageId" element={<BookingPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/activate" element={<ActivateAccountPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;