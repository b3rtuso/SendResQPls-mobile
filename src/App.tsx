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
import GetTheApp from './pages/GetTheApp';
import BottomNav from './components/BottomNav';
import { MobileToastProvider } from './components/MobileToastProvider';
import { ConfirmProvider } from './contexts/ConfirmContext';
import FcmBannerOverlay from './components/FcmBannerOverlay';
import LocationSuccessModal from './components/LocationSuccessModal';
import GlobalStatusSync from './components/GlobalStatusSync';
import ErrorBoundary from './components/ErrorBoundary';
import { useState, useEffect, useRef } from 'react';
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

const TAB_ORDER: Record<string, number> = {
  '/mobile': 0,
  '/mobile/': 0,
  '/mobile/report': 1,
  '/mobile/notifications': 2,
  '/mobile/history': 3,
  '/mobile/profile': 4,
};

function getTabIndex(pathname: string): number {
  const clean = pathname.replace(/\/+$/, '') || '/mobile';
  if (clean in TAB_ORDER) return TAB_ORDER[clean];
  if (clean.startsWith('/mobile/report')) return 1;
  if (clean.startsWith('/mobile/notifications')) return 2;
  if (clean.startsWith('/mobile/history')) return 3;
  if (clean.startsWith('/mobile/profile')) return 4;
  return 0;
}

function AuthenticatedMobileLayout() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const prevIdxRef = useRef(getTabIndex(location.pathname));
  const directionRef = useRef<'right' | 'left'>('right');

  const currentIdx = getTabIndex(location.pathname);
  if (location.pathname !== prevPathRef.current) {
    directionRef.current = currentIdx >= prevIdxRef.current ? 'right' : 'left';
    prevIdxRef.current = currentIdx;
    prevPathRef.current = location.pathname;
  }

  const transitionClass =
    directionRef.current === 'right' ? 'mobile-tab-slide-right' : 'mobile-tab-slide-left';

  return (
    <div className="mobile-shell w-full min-h-screen flex flex-col bg-[#F1F5F9]">
      <GlobalStatusSync />
      {/* Scrollable animated viewport for the active tab */}
      <div
        key={location.pathname}
        className={`mobile-tab-view ${transitionClass} w-full flex-1 flex flex-col`}
      >
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
      <Route path="onboarding" element={<MobileOnboarding onDone={() => setOnboardingDone(true)} />} />

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
      {/* Catch-all for /mobile/* — redirect to login instead of rendering empty page */}
      <Route path="*" element={<Navigate to="login" replace />} />
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
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://sendresqpls.onrender.com/api');
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
                  <LocationSuccessModal />
                  <BackButtonHandler />
                  <RouterAwareNotificationSetup />
                  <AnimatedMobileRoutes />
                </ConfirmProvider>
              </MobileToastProvider>
            }
          />
          {/* Direct top-level reset-password route (completely bypasses /mobile middleware) */}
          <Route
            path="/reset-password"
            element={
              <MobileToastProvider>
                <ConfirmProvider>
                  <MobileResetPassword />
                </ConfirmProvider>
              </MobileToastProvider>
            }
          />
          {/* Standalone GetTheApp download / info portal */}
          <Route path="/get-the-app" element={<GetTheApp />} />
          {/* Top-level aliases for direct web access */}
          <Route path="/login" element={<Navigate to="/mobile/login" replace />} />
          <Route path="/signup" element={<Navigate to="/mobile/signup" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/mobile/forgot-password" replace />} />
          {/* Root redirect (points to /mobile, which lets PrivateRoute navigate to login or home) */}
          <Route path="/" element={<Navigate to="/mobile" replace />} />
          <Route path="*" element={<Navigate to="/mobile" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
