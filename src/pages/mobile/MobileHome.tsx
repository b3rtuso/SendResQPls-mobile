import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Wind, ChevronDown, WifiOff } from 'lucide-react';
import { FaFire, FaHouseFloodWater, FaLocationDot, FaPlus } from 'react-icons/fa6';
import { FaCog } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { RiCriminalFill, RiTyphoonFill } from 'react-icons/ri';
import { MdLandslide } from 'react-icons/md';
import { setupPushNotifications } from '../../utils/pushNotificationHelper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const hotlines = [
  { name: 'National Emergency', number: '911', color: '#1E293B' },
  { name: 'Red Cross', number: '143', color: '#EF4444' },
  { name: 'MDRRMO Balayan', number: '09171234567', color: '#2563EB' },
  { name: 'BFP Fire', number: '160', color: '#F59E0B' },
];

const safetyTips = [
  { icon: Wind,             color: '#2563EB', bg: '#EFF6FF', title: 'Stay Calm',       tip: 'Take deep breaths. Panicking makes it harder to think clearly.' },
  { icon: FaHouseFloodWater,color: '#0EA5E9', bg: '#F0F9FF', title: 'Flood Safety',    tip: 'Move to high ground immediately. Do not walk or drive through floodwaters.' },
  { icon: FaFire,           color: '#EF4444', bg: '#FEF2F2', title: 'Fire Safety',     tip: 'Stay away from smoke. Cover your nose with a damp cloth and evacuate immediately.' },
  { icon: FaPlus,           color: '#DC2626', bg: '#FFFFFF', title: 'First Aid',      tip: 'Apply pressure to wounds with a clean cloth to stop bleeding. Do not move injured persons unless necessary.' },
  { icon: RiCriminalFill,   color: '#000000', bg: '#F1F5F9', title: 'Crime Safety',    tip: 'Stay in a safe location and lock your doors. Call emergency services immediately — do not confront threats alone.' },
  { icon: RiTyphoonFill,    color: '#0284C7', bg: '#E0F2FE', title: 'Typhoon Safety',  tip: 'Secure loose objects, move to an interior room away from windows, and monitor official PAGASA advisories.' },
  { icon: MdLandslide,      color: '#78716C', bg: '#F5F5F4', title: 'Landslide Safety',tip: 'Move away from slopes and valleys immediately. Listen for unusual sounds like cracking or rumbling.' },
];

import { useLocationChecker } from '../../utils/useLocationChecker';
import { useNetworkStatus } from '../../utils/useNetworkStatus';

export default function MobileHome() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const userId = localStorage.getItem('userId');

  // Real-time location state via useLocationChecker (framework: Phone GPS ON? -> Allowed? -> Continue)
  const { isLocationOn, status: locStatus, recheckLocation, requestLocation, requesting: locRequesting, openLocationSettings, openAppSettings } = useLocationChecker();
  const [showLocModal, setShowLocModal] = useState(false);

  // Real-time network state via native Capacitor Network plugin
  const isOnline = useNetworkStatus();


  // Request location permission first, then notifications sequentially (magkasunod)
  useEffect(() => {
    let isMounted = true;

    async function initPermissionsSequentially() {
      // Step 1: Request GPS Location first
      await recheckLocation();

      // Step 2: Polite breathing delay so dialogs appear sequentially
      await new Promise(r => setTimeout(r, 600));
      if (!isMounted) return;

      // Step 3: Request Push Notifications second
      if (userId) {
        try {
          await setupPushNotifications();
        } catch (err) {
          console.warn('[Push] Sequential setup error:', err);
        }
      }
    }

    initPermissionsSequentially();

    return () => {
      isMounted = false;
    };
  }, [userId, recheckLocation]);


  return (
    <div className="w-full flex-1 flex flex-col bg-[#F1F5F9]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .srq-hotline-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04);
          border: 1px solid rgba(226,232,240,0.8);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        }
        .srq-hotline-card:active {
          transform: scale(0.96);
          box-shadow: 0 1px 4px rgba(15,23,42,0.08);
        }
        .srq-tip-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: #FFFFFF;
          border-radius: 16px;
          align-items: flex-start;
          box-shadow: 0 1px 3px rgba(15,23,42,0.03), 0 4px 12px rgba(15,23,42,0.02);
          border: 1px solid #E2E8F0;
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        }
        .srq-tip-card:active {
          transform: scale(0.98);
        }
        .srq-section-label {
          font-size: 10.5px;
          font-weight: 800;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 14px;
        }
      `}</style>
      <div style={{ flex: 1, paddingBottom: 80 }}>

        {/* ── Header (normal flow — stays at the top of the page, does not follow scroll) ── */}
        <div className="mobile-home-header w-full" style={{ marginBottom: 'clamp(14px, 3.5vw, 24px)' }}>
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
            {/* Top row: logo + actions */}
            <div className="header-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.svg" alt="SRQ" style={{ width: 'clamp(32px, 8.5vw, 36px)', height: 'clamp(32px, 8.5vw, 36px)', borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.25)' }} />
                <div>
                  <div style={{ fontSize: 'clamp(9px, 2.5vw, 10px)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1 }}>SendResQPls</div>
                  <div style={{ fontSize: 'clamp(10px, 2.8vw, 11px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3, marginTop: 1 }}>MDRRMO Balayan, Batangas</div>
                </div>
              </div>
              {/* Clickable Avatar redirects to Profile */}
              <div
                onClick={() => navigate('/mobile/profile')}
                style={{ cursor: 'pointer' }}
                aria-label="Profile"
              >
                <Avatar style={{
                  width: 'clamp(34px, 9vw, 38px)', height: 'clamp(34px, 9vw, 38px)',
                  background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)',
                  fontWeight: 800, fontSize: 'clamp(11px, 3vw, 13px)', color: 'white',
                }}>
                  <AvatarFallback style={{ background: 'transparent', color: 'white' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            {/* Greeting row */}
            <div>
              <div className="greeting">Hello,</div>
              <div className="user-name">{userName}</div>
            </div>
          </div>
        </div>

        {/* ── SOS Card ─────────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
          <div
            className="sos-card max-w-xl mx-auto sm:p-8 md:p-10 sm:rounded-3xl"
            onClick={() => navigate('/mobile/report')}
            role="button"
            tabIndex={0}
            aria-label="Send emergency alert to MDRRMO"
            style={{ margin: '0 auto' }}
          >
            {/* Concentric radar pulse container */}
            <div style={{ position: 'relative', width: 'clamp(58px, 15vw, 72px)', height: 'clamp(58px, 15vw, 72px)', margin: '0 auto clamp(10px, 2.5vw, 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer radar wave 1 */}
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.4)',
                animation: 'radarPing 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                pointerEvents: 'none',
              }} />
              {/* Outer radar wave 2 (staggered) */}
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                animation: 'radarPing 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.1s',
                pointerEvents: 'none',
              }} />
              {/* Inner Glowing SOS Icon Circle */}
              <div style={{
                width: 'clamp(50px, 13vw, 62px)', height: 'clamp(50px, 13vw, 62px)', borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                position: 'relative', zIndex: 1,
              }}>
                <AlertTriangle size={28} strokeWidth={2.4} color="white" />
              </div>
            </div>

            <h2 style={{ letterSpacing: 'clamp(0.5px, 0.3vw, 1.5px)', fontSize: 'clamp(16px, 4.6vw, 20px)', margin: 0, fontWeight: 900 }}>SEND EMERGENCY ALERT</h2>
            <p style={{ fontSize: 'clamp(11.5px, 3.2vw, 12.5px)', opacity: 0.88, marginTop: 6, marginBottom: 0, letterSpacing: '0.1px', lineHeight: 1.45 }}>
              Tap to instantly report an incident to MDRRMO Balayan
            </p>
            <div className="tap-hint" style={{ marginTop: 'clamp(8px, 2vw, 12px)' }}>
              <span className="tap-arrow"><ChevronDown size={12} /></span>
              <span>TAP TO REPORT NOW</span>
              <span className="tap-arrow"><ChevronDown size={12} /></span>
            </div>
          </div>

          {/* Offline badge */}
          {!isOnline && (
            <div className="max-w-xl mx-auto" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              marginTop: 12,
              padding: '8px 16px',
              background: '#FEF3C7',
              border: '1.5px solid #FDE68A',
              borderRadius: 40,
              fontSize: 12,
              fontWeight: 700,
              color: '#B45309',
              letterSpacing: '0.01em',
              animation: 'fadeUp 0.3s ease both',
              textAlign: 'center',
              lineHeight: 1.4,
            }}>
              <WifiOff size={14} color="#D97706" style={{ flexShrink: 0 }} />
              <span>Offline Mode — emergency reports will be saved to your offline queue and sent automatically once reconnected</span>
            </div>
          )}
        </div>

        {/* ── Location Status Strip (taste-skill redesign: flat navy, left-edge accent) ── */}
        {isLocationOn === false && (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
            <div
              className="max-w-xl mx-auto"
              onClick={() => setShowLocModal(true)}
              role="button"
              tabIndex={0}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: 'clamp(11px, 2.8vw, 14px) clamp(12px, 3.5vw, 16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 2.5vw, 12px)',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
              }}
            >
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: '#2563EB',
                boxShadow: '0 0 0 3px rgba(37,99,235,0.18)',
              }} />

              {/* Text block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'clamp(11.5px, 3.2vw, 12.5px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.1px', marginBottom: 2 }}>
                  {locStatus === 'PERMISSION_DENIED' ? 'Location permission blocked' : 'Location (GPS) is off'}
                </div>
                <div style={{ fontSize: 'clamp(10.5px, 2.8vw, 11.5px)', color: '#64748B', lineHeight: 1.4 }}>
                  {locStatus === 'PERMISSION_DENIED'
                    ? 'Tap to open App Settings and allow access.'
                    : 'Turn on GPS so responders can find you.'}
                </div>
              </div>

              {/* Primary action button */}
              {locStatus === 'PERMISSION_DENIED' ? (
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); openAppSettings(); }}
                  style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: 'clamp(5px, 1.5vw, 7px) clamp(8px, 2.5vw, 12px)', borderRadius: 8, height: 'auto',
                    background: '#2563EB', border: 'none',
                    color: 'white', fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 700,
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  <FaCog size={12} /> Settings
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={locRequesting}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = await requestLocation();
                    if (ok) setShowLocModal(false);
                  }}
                  style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: 'clamp(5px, 1.5vw, 7px) clamp(8px, 2.5vw, 12px)', borderRadius: 8, height: 'auto',
                    background: locRequesting ? '#1D4ED8' : '#2563EB', border: 'none',
                    color: 'white', fontSize: 'clamp(11px, 3vw, 12px)', fontWeight: 700,
                    whiteSpace: 'nowrap' as const,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)',
                    opacity: locRequesting ? 0.85 : 1,
                  }}
                >
                  {locRequesting ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Detecting…
                    </>
                  ) : (
                    <><FaLocationDot size={12} /> Enable GPS</>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Emergency Hotlines ─────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <p className="srq-section-label" style={{ fontSize: 'clamp(9.5px, 2.6vw, 11px)' }}>Emergency Hotlines</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {hotlines.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="srq-hotline-card h-full"
              >
                {/* Colored header — row layout with number and dial phone icon */}
                <div style={{
                  background: `linear-gradient(135deg, ${h.color}ee 0%, ${h.color}aa 100%)`,
                  padding: 'clamp(8px, 2.2vw, 12px) clamp(8px, 2.5vw, 12px) clamp(7px, 2vw, 10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  {/* Number */}
                  <div style={{
                    fontSize: 'clamp(13px, 3.8vw, 15px)',
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-0.3px',
                    lineHeight: 1,
                    wordBreak: 'break-all',
                  }}>
                    {h.number}
                  </div>
                  {/* Icon pill */}
                  <div style={{
                    width: 'clamp(24px, 6.5vw, 28px)', height: 'clamp(24px, 6.5vw, 28px)', borderRadius: 8,
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FiPhone size={13} color="white" />
                  </div>
                </div>
                {/* Name row */}
                <div style={{
                  padding: 'clamp(6px, 1.8vw, 8px) clamp(8px, 2.5vw, 12px) clamp(8px, 2vw, 10px)',
                  fontSize: 'clamp(10px, 2.8vw, 11.5px)',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.1px',
                  lineHeight: 1.25,
                }}>
                  {h.name}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Safety Tips ─────────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <p className="srq-section-label" style={{ fontSize: 'clamp(9.5px, 2.6vw, 11px)' }}>Emergency Safety Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {safetyTips.map((t) => (
              <div
                key={t.title}
                className="srq-tip-card h-full"
                style={{ padding: 'clamp(12px, 3.5vw, 16px)', gap: 'clamp(10px, 2.8vw, 14px)' }}
              >
                {/* Icon box with tint */}
                <div style={{
                  width: 'clamp(38px, 10vw, 44px)', height: 'clamp(38px, 10vw, 44px)', borderRadius: 14,
                  background: t.bg, border: `1.5px solid ${t.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <t.icon size={19} color={t.color} strokeWidth={2} />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'clamp(12.5px, 3.4vw, 13.5px)', fontWeight: 800, color: '#0F172A',
                    marginBottom: 4, letterSpacing: '-0.1px',
                  }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 'clamp(10.5px, 2.8vw, 11.5px)', color: '#64748B', lineHeight: 1.6 }}>
                    {t.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>


      {/* ── Location Framework Modal (Screen-Centered Dialog) ── */}
      {showLocModal && (
        <div
          onClick={() => setShowLocModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 'clamp(20px, 4vw, 28px) clamp(16px, 4vw, 24px)',
              width: 'min(420px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.32)',
              animation: 'modalScaleIn 0.28s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 18,
                background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
                border: '1.5px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                {locStatus === 'PERMISSION_DENIED' ? (
                  <FaCog size={24} color="#2563EB" />
                ) : (
                  <FaLocationDot size={26} color="#2563EB" />
                )}
              </div>

              <div style={{
                fontSize: 19, fontWeight: 900, color: '#0F172A',
                textAlign: 'center', marginBottom: 6, letterSpacing: '-0.3px',
              }}>
                {locStatus === 'PERMISSION_DENIED'
                  ? 'Allow SendResQPls Location'
                  : 'Turn On Phone Location'}
              </div>

              <div style={{
                fontSize: 13, color: '#64748B', lineHeight: 1.5,
                textAlign: 'center', marginBottom: 18,
              }}>
                {locStatus === 'PERMISSION_DENIED'
                  ? 'SendResQPls needs location permission to dispatch emergency responders directly to your coordinates in Balayan.'
                  : 'Your phone GPS is currently switched off. Turn on location services so SendResQPls can find you.'}
              </div>
            </div>

            {/* Step-by-step instructions card */}
            <div style={{
              background: '#F8FAFC', borderRadius: 16, padding: '16px',
              border: '1px solid #E2E8F0', marginBottom: 20,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {locStatus === 'PERMISSION_DENIED' ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      Tap <strong>Open App Settings</strong> below (or tap the 🔒 lock icon in browser).
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      Tap <strong>Permissions</strong> → <strong>Location</strong> → choose <strong>Allow</strong>.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      Return here and tap <strong>Check Location Now</strong>.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#DC2626', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      Tap <strong>Enable Location</strong> below — your phone will show a location prompt.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#DC2626', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      If asked, tap <strong>Allow</strong> or turn on <strong>📍 Location / GPS</strong> in the popup.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#DC2626', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
                      The app will automatically detect your location once enabled.
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {locStatus === 'PERMISSION_DENIED' ? (
                /* Permission was blocked — only way is to go to OS settings */
                <Button
                  onClick={() => openAppSettings()}
                  style={{
                    width: '100%', padding: '15px 20px',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: 'white', border: 'none', borderRadius: 16,
                    fontSize: 15, fontWeight: 800,
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    minHeight: 48,
                  }}
                >
                  <FaCog size={15} /> Open App Settings
                </Button>
              ) : (
                /* GPS off or not yet asked — fire the native browser dialog directly */
                <Button
                  disabled={locRequesting}
                  onClick={async () => {
                    const ok = await requestLocation();
                    if (ok) setShowLocModal(false);
                  }}
                  style={{
                    width: '100%', padding: '15px 20px',
                    background: locRequesting ? '#1D4ED8' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: 'white', border: 'none', borderRadius: 16,
                    fontSize: 15, fontWeight: 800,
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: locRequesting ? 0.85 : 1,
                    minHeight: 48,
                  }}
                >
                  {locRequesting ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Detecting Location…
                    </>
                  ) : (
                    <><FaLocationDot size={16} /> Enable GPS</>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => openLocationSettings()}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: '#F8FAFC', color: '#1E293B',
                  border: '1.5px solid #CBD5E1', borderRadius: 16,
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  minHeight: 48,
                }}
              >
                <FaCog size={15} color="#2563EB" /> Open Phone Settings
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  const ok = await recheckLocation();
                  if (ok) {
                    setShowLocModal(false);
                  }
                }}
                style={{
                  width: '100%', padding: '13px 20px',
                  background: '#F1F5F9', color: '#1E293B',
                  border: '1.5px solid #CBD5E1', borderRadius: 16,
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  minHeight: 48,
                }}
              >
                <FaLocationDot size={15} color="#2563EB" /> Check Location Now
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowLocModal(false)}
                style={{
                  width: '100%', padding: '11px 20px',
                  color: '#64748B',
                  borderRadius: 16,
                  fontSize: 13, fontWeight: 600,
                }}
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
