import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import BookingFlow from './pages/BookingFlow';
import BookingConfirm from './pages/BookingConfirm';
import BookingSuccess from './pages/BookingSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import Trekking from './pages/Trekking';
import TrekDetail from './pages/TrekDetail';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Rentals from './pages/Rentals';
import RentalDetail from './pages/RentalDetail';
import Homestays from './pages/Homestays';
import HomestayDetail from './pages/HomestayDetail';
import Houseboats from './pages/Houseboats';
import HouseboatDetail from './pages/HouseboatDetail';
import ListHomestay from './pages/ListHomestay';
import Heritage from './pages/Heritage';
import Nature from './pages/Nature';
import BorderTourism from './pages/BorderTourism';
import Photoshoot from './pages/Photoshoot';
import KashmirHimalayanCircuit from './pages/KashmirHimalayanCircuit';
import LadakhRoutes from './pages/LadakhRoutes';
import LadakhRouteDetail from './pages/LadakhRouteDetail';
import Literature from './pages/Literature';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import SubmitArticle from './pages/SubmitArticle';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import CancellationPolicy from './pages/CancellationPolicy';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminHotels from './pages/admin/AdminHotels';
import AdminPackages from './pages/admin/AdminPackages';
import AdminTreks from './pages/admin/AdminTreks';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminActivities from './pages/admin/AdminActivities';
import AdminHomestays from './pages/admin/AdminHomestays';
import AdminHouseboats from './pages/admin/AdminHouseboats';
import AdminArticles from './pages/admin/AdminArticles';
import AdminBooks from './pages/admin/AdminBooks';
import AdminSettings from './pages/admin/AdminSettings';

function ScrollToTop() {
  const { pathname, key } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, key]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="hotels/:slug" element={<HotelDetail />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:slug" element={<PackageDetail />} />
        <Route path="trekking" element={<Trekking />} />
        <Route path="trekking/:slug" element={<TrekDetail />} />
        <Route path="treks/:slug" element={<TrekDetail />} />
        <Route path="activities" element={<Activities />} />
        <Route path="activities/:slug" element={<ActivityDetail />} />
        <Route path="rentals" element={<Rentals />} />
        <Route path="rentals/:slug" element={<RentalDetail />} />
        <Route path="homestays" element={<Homestays />} />
        <Route path="homestays/:slug" element={<HomestayDetail />} />
        <Route path="houseboats" element={<Houseboats />} />
        <Route path="houseboats/:slug" element={<HouseboatDetail />} />
        <Route path="list-homestay" element={<ListHomestay />} />
        <Route path="heritage" element={<Heritage />} />
        <Route path="heritage/:id" element={<Heritage />} />
        <Route path="nature" element={<Nature />} />
        <Route path="nature/:id" element={<Nature />} />
        <Route path="border-tourism" element={<BorderTourism />} />
        <Route path="border-tourism/:id" element={<BorderTourism />} />
        <Route path="photoshoot" element={<Photoshoot />} />
        <Route path="photoshoot/:id" element={<Photoshoot />} />
        <Route path="border-tourism" element={<BorderTourism />} />
        <Route path="border-tourism/:id" element={<BorderTourism />} />
        <Route path="photoshoot" element={<Photoshoot />} />
        <Route path="photoshoot/:id" element={<Photoshoot />} />
        <Route path="khc" element={<KashmirHimalayanCircuit />} />
        <Route path="khc/:section" element={<KashmirHimalayanCircuit />} />
        <Route path="ladakh-routes" element={<LadakhRoutes />} />
        <Route path="ladakh-routes/:slug" element={<LadakhRouteDetail />} />
        <Route path="routes" element={<LadakhRoutes />} />
        <Route path="routes/:slug" element={<LadakhRouteDetail />} />
        <Route path="literature" element={<Literature />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
        <Route path="books" element={<Books />} />
        <Route path="books/:slug" element={<BookDetail />} />
        <Route path="submit-article" element={<SubmitArticle />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-conditions" element={<TermsConditions />} />
        <Route path="cancellation-policy" element={<CancellationPolicy />} />
        <Route path="booking/:slug" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
        <Route path="booking/confirm" element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
        <Route path="booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
        <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="/admin/destinations" replace />} />
        <Route path="destinations" element={<AdminDestinations />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="treks" element={<AdminTreks />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="homestays" element={<AdminHomestays />} />
        <Route path="houseboats" element={<AdminHouseboats />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      </Routes>
    </>
  );
}
