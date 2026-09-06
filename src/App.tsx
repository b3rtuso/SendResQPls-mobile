import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
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
import BottomNav from './components/BottomNav';
import { MobileToastProvider } from './components/MobileToastProvider';
import { ConfirmProvider } from './contexts/ConfirmContext';
import FcmBannerOverlay from './components/FcmBannerOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import { useState, useEffect } from 'react';
import { registerPushNavigate, unregisterPushNavigate, consumePendingRoute } from './utils/pushNotificationHelper';
import { App as CapApp } from '@capacitor/app';
import './App.css';

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listenerHandle: any = null;

    const setupListener = async () => {
      try {
        listenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const path = location.pathname;
          // Exit app immediately on login, root, or home
          if (
            path === '/mobile/login' ||
            path === '/mobile' ||
            path === '/mobile/' ||
            path === '/'
          ) {
            CapApp.exitApp();
          } else if (canGoBack) {
            navigate(-1);
          } else {
            CapApp.exitApp();
          }
        });
      } catch {
        // Running on web, ignore
      }
    };

    setupListener();

    return () => {
      if (listenerHandle?.remove) {
        listenerHandle.remove();
      }
    };
  }, [location.pathname, navigate]);

  return null;
}

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

function AuthenticatedMobileLayout() {
  const location = useLocation();

  return (
    <div className="mobile-shell">
      {/* Scrollable animated viewport for the active tab */}
      <div key={location.pathname} className="mobile-tab-view">
        <Outlet />
      </div>

      {/* Persistent BottomNav: permanently mounted in the shell */}
      <BottomNav />
    </div>
  );
}

function AnimatedMobileRoutes() {
  const [onboardingDone, setOnboardingDone] = useState(!shouldShowOnboarding());

  return (
    <Routes>
      {/* Public Auth Screens (Full-screen, no navbar) */}
      <Route path="login" element={<MobileLogin />} />
      <Route path="signup" element={<MobileSignup />} />
      <Route path="forgot-password" element={<MobileForgotPassword />} />
      <Route path="reset-password" element={<MobileResetPassword />} />

      {/* Authenticated Tab Shell (Persistent navbar + unified tab transitions) */}
      <Route
        element={
          !onboardingDone ? (
            <MobileOnboarding onDone={() => setOnboardingDone(true)} />
          ) : (
            <PrivateRoute>
              <AuthenticatedMobileLayout />
            </PrivateRoute>
          )
        }
      >
        <Route path="" element={<MobileHome />} />
        <Route path="report" element={<MobileReport />} />
        <Route path="history" element={<MobileHistory />} />
        <Route path="profile" element={<MobileProfile />} />
        <Route path="notifications" element={<MobileNotifications />} />
      </Route>
    </Routes>
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
                  <BackButtonHandler />
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