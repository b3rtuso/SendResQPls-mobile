import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MobileLogin from './pages/mobile/MobileLogin';
import MobileSignup from './pages/mobile/MobileSignup';
import MobileHome from './pages/mobile/MobileHome';
import MobileReport from './pages/mobile/MobileReport';
import MobileHistory from './pages/mobile/MobileHistory';
import MobileProfile from './pages/mobile/MobileProfile';
import MobileNotifications from './pages/mobile/MobileNotifications';
import MobileOnboarding, { shouldShowOnboarding } from './pages/mobile/MobileOnboarding';
import MobileForgotPassword from './pages/mobile/MobileForgotPassword';
import MobileResetPassword from './pages/mobile/MobileResetPassword';
import { MobileToastProvider } from './components/MobileToastProvider';
import { ConfirmProvider } from './contexts/ConfirmContext';
import FcmBannerOverlay from './components/FcmBannerOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { registerPushNavigate, unregisterPushNavigate, consumePendingRoute } from './utils/pushNotificationHelper';
import './App.css';

function RouterAwareNotificationSetup() {
  const navigate = useNavigate();
  useEffect(() => {
    registerPushNavigate(navigate);
    const pending = consumePendingRoute();
    if (pending) navigate(pending, { replace: true });
    return () => { unregisterPushNavigate(); };
  }, [navigate]);
  return null;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const location = useLocation();
  if (!token || role === 'ADMIN') {
    if (role === 'ADMIN') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
    return <Navigate to="/mobile/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function MobileHomeWithOnboarding() {
  const [done, setDone] = useState(!shouldShowOnboarding());
  if (!done) return <MobileOnboarding onDone={() => setDone(true)} />;
  return <PrivateRoute><MobileHome /></PrivateRoute>;
}

function getRouteTabOrder(pathname: string): number {
  const clean = pathname.replace(/\/$/, '');
  if (clean === '/mobile' || clean === '') return 0;
  if (clean.startsWith('/mobile/report')) return 1;
  if (clean.startsWith('/mobile/notifications')) return 2;
  if (clean.startsWith('/mobile/history')) return 3;
  if (clean.startsWith('/mobile/profile')) return 4;
  return -1;
}

let lastMobilePath = '';

function AnimatedMobileRoutes() {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentOrder = getRouteTabOrder(currentPath);
  const prevOrder = lastMobilePath ? getRouteTabOrder(lastMobilePath) : -1;

  let transitionClass = 'mobile-page-fade-scale';
  if (lastMobilePath && currentOrder !== -1 && prevOrder !== -1) {
    if (currentOrder > prevOrder) {
      transitionClass = 'mobile-page-slide-left';
    } else if (currentOrder < prevOrder) {
      transitionClass = 'mobile-page-slide-right';
    } else {
      transitionClass = 'mobile-page-fade';
    }
  }

  useEffect(() => {
    lastMobilePath = currentPath;
  }, [currentPath]);

  return (
    <div key={currentPath} className={`mobile-page-transition ${transitionClass}`}>
      <Routes location={location}>
        <Route path="login" element={<MobileLogin />} />
        <Route path="signup" element={<MobileSignup />} />
        <Route path="forgot-password" element={<MobileForgotPassword />} />
        <Route path="reset-password" element={<MobileResetPassword />} />
        <Route path="" element={<MobileHomeWithOnboarding />} />
        <Route path="report" element={<PrivateRoute><MobileReport /></PrivateRoute>} />
        <Route path="history" element={<PrivateRoute><MobileHistory /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><MobileProfile /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><MobileNotifications /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const healthUrl = apiBase.replace(/\/api\/?$/, '') + '/health';
      fetch(healthUrl, { method: 'GET', mode: 'cors' }).catch(() => {});
    } catch {
      // Ignore background warmup errors
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route
            path="/mobile/*"
            element={
              <MobileToastProvider>
                <ConfirmProvider>
                  <FcmBannerOverlay />
                  <RouterAwareNotificationSetup />
                  <AnimatedMobileRoutes />
                </ConfirmProvider>
              </MobileToastProvider>
            }
          />
          {/* Redirect root to /mobile */}
          <Route path="/" element={<Navigate to="/mobile" replace />} />
          <Route path="*" element={<Navigate to="/mobile" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;