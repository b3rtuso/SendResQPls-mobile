import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, AlertTriangle } from 'lucide-react';
import { FaLocationDot } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'srq_onboarding_done';

interface SlideData {
  category: string;
  badgeIcon: any;
  accentColor: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  type: 'camera' | 'map' | 'status';
}

const slides: SlideData[] = [
  {
    category: 'Report',
    badgeIcon: Camera,
    accentColor: '#2563EB',
    badgeBg: '#EFF6FF',
    title: 'Snap & Report Emergency',
    subtitle: 'Photograph the scene. AI instantly detects disaster type and tags your exact GPS coordinates.',
    type: 'camera',
  },
  {
    category: 'Dispatch',
    badgeIcon: AlertTriangle,
    accentColor: '#DC2626',
    badgeBg: '#FEF2F2',
    title: 'MDRRMO Balayan Triage',
    subtitle: 'Command Center reviews priorities in real time and routes alerts to the nearest response team.',
    type: 'map',
  },
  {
    category: 'Live Track',
    badgeIcon: ShieldCheck,
    accentColor: '#16A34A',
    badgeBg: '#F0FDF4',
    title: 'Real-Time Responder ETA',
    subtitle: 'Track responder location on live GPS and receive instant status updates until help arrives.',
    type: 'status',
  },
];

export default function MobileOnboarding({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const navigate = useNavigate();

  const touchStartX = useRef<number | null>(null);

  const goTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setSlideDirection(index > current ? 'next' : 'prev');
    setCurrent(index);
  };

  const goNext = () => {
    if (current < slides.length - 1) {
      setSlideDirection('next');
      setCurrent(c => c + 1);
    } else {
      handleGetStarted();
    }
  };

  const goPrev = () => {
    if (current > 0) {
      setSlideDirection('prev');
      setCurrent(c => c - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  const skip = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    onDone();
    navigate('/mobile/login', { replace: true });
  };

  const handleGetStarted = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    onDone();
    navigate('/mobile/login', { replace: true });
  };

  const handleCreateAccount = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    onDone();
    navigate('/mobile/signup', { replace: true });
  };

  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className="onb-viewport-wrapper">
      <style>{`
        /* Viewport Frame styling for all devices */
        .onb-viewport-wrapper {
          min-height: 100dvh;
          width: 100%;
          background: #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          user-select: none;
          box-sizing: border-box;
          padding: 0;
        }

        .onb-device-frame {
          width: 100%;
          max-width: 480px;
          min-height: 100dvh;
          background: #F1F5F9;
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
          margin: 0 auto;
          box-shadow: none;
        }

        /* Desktop & Tablet browser view: elevated card preview */
        @media (min-width: 641px) {
          .onb-viewport-wrapper {
            padding: 24px 16px;
            background: linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%);
          }
          .onb-device-frame {
            min-height: clamp(660px, 90vh, 840px);
            max-height: 94vh;
            border-radius: 32px;
            box-shadow:
              0 24px 60px -12px rgba(15, 23, 42, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.7) inset,
              0 0 0 1px rgba(15, 23, 42, 0.08);
          }
        }

        /* Slide Transition Animations */
        @keyframes onbFadeSlideNext {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes onbFadeSlidePrev {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .onb-content-animate {
          animation: ${slideDirection === 'next' ? 'onbFadeSlideNext' : 'onbFadeSlidePrev'} 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Responsive Top Bar */
        .onb-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(14px, 2.5vh, 22px) clamp(16px, 4.5vw, 24px) clamp(6px, 1vh, 10px);
          z-index: 10;
          flex-shrink: 0;
        }

        /* Responsive Body Container */
        .onb-body-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(6px, 1.2vh, 12px) clamp(16px, 4.5vw, 24px) max(clamp(16px, 2.8vh, 26px), env(safe-area-inset-bottom));
          box-sizing: border-box;
          min-height: 0;
        }

        /* Responsive Typography */
        .onb-title {
          font-size: clamp(20px, 5.5vw, 26px);
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0 0 clamp(6px, 1vh, 10px);
        }

        .onb-subtitle {
          font-size: clamp(12.5px, 3.2vw, 14px);
          color: #64748B;
          line-height: 1.5;
          margin: 0;
          max-width: 440px;
        }

        /* Center Visual Preview Card */
        .onb-preview-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(8px, 1.8vh, 18px) 0;
          min-height: 0;
          width: 100%;
        }

        .onb-preview-card {
          width: 100%;
          max-width: clamp(270px, 86vw, 360px);
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Viewfinder screen inside Camera preview */
        .onb-viewfinder {
          height: clamp(135px, 22vh, 175px);
          border-radius: 14px;
          background-image: url(/flood_sample.jpg);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: clamp(8px, 1.5vh, 10px) 8px;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.55);
        }

        /* Map graphic container */
        .onb-map-graphic {
          height: clamp(110px, 17vh, 140px);
          border-radius: 14px;
          background: #E2E8F0;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Interactive Dot Indicators */
        .onb-dots-wrap {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
          margin: clamp(10px, 2vh, 18px) 0 clamp(8px, 1.6vh, 14px);
          flex-shrink: 0;
        }

        .onb-dot {
          height: 8px;
          border-radius: 999px;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          padding: 0;
          cursor: pointer;
        }

        /* Buttons & Actions */
        .onb-btn-stack {
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 1.4vh, 11px);
          width: 100%;
          flex-shrink: 0;
        }

        .onb-action-btn {
          width: 100%;
          min-height: clamp(46px, 5.8vh, 52px);
          padding: clamp(12px, 1.8vh, 16px);
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: #FFFFFF;
          border: none;
          border-radius: 14px;
          font-size: clamp(14px, 3.2vw, 15px);
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
          transition: transform 0.18s, box-shadow 0.18s;
          letter-spacing: 0.01em;
        }
        .onb-action-btn:hover {
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
        }
        .onb-action-btn:active {
          transform: scale(0.98);
        }

        .onb-secondary-btn {
          width: 100%;
          min-height: clamp(46px, 5.8vh, 52px);
          padding: clamp(11px, 1.7vh, 15px);
          background: #FFFFFF;
          color: #0F172A;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: clamp(14px, 3.2vw, 15px);
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
        }
        .onb-secondary-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }
        .onb-secondary-btn:active {
          background: #F1F5F9;
          transform: scale(0.98);
        }

        /* Compact height screens (e.g. landscape or phones < 650px height) */
        @media (max-height: 650px) {
          .onb-preview-wrap {
            padding: 4px 0;
          }
          .onb-viewfinder {
            height: 120px;
          }
          .onb-map-graphic {
            height: 95px;
          }
          .onb-title {
            margin-bottom: 4px;
          }
          .onb-subtitle {
            line-height: 1.35;
          }
        }
      `}</style>

      {/* ── Main Mobile Shell / Frame ── */}
      <div
        className="onb-device-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Top Bar ── */}
        <div className="onb-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/logo.svg"
              alt="SRQ Logo"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              SendResQPls
            </span>
          </div>

          {!isLast ? (
            <button
              onClick={skip}
              type="button"
              aria-label="Skip onboarding"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'color 0.15s, border-color 0.15s, transform 0.15s',
              }}
            >
              Skip
            </button>
          ) : (
            <div style={{ width: 48 }} />
          )}
        </div>

        {/* ── Main Slide Card Body ── */}
        <div key={current} className="onb-body-container onb-content-animate">
          {/* Category & Headline */}
          <div style={{ flexShrink: 0, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: slide.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: `0 2px 10px ${slide.accentColor}33`,
                  flexShrink: 0,
                }}
              >
                <BadgeIcon size={16} strokeWidth={2.2} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#64748B',
                  letterSpacing: '0.02em',
                }}
              >
                {slide.category}
              </span>
            </div>

            {/* Bold Headline */}
            <h1 className="onb-title">{slide.title}</h1>

            {/* Underline Indicator Accent */}
            <div
              style={{
                width: 36,
                height: 3.5,
                borderRadius: 4,
                background: slide.accentColor,
                marginBottom: 8,
              }}
            />

            <p className="onb-subtitle">{slide.subtitle}</p>
          </div>

          {/* Center UI Preview Card */}
          <div className="onb-preview-wrap">
            {slide.type === 'camera' && (
              <div
                className="onb-preview-card"
                style={{
                  background: '#0F172A',
                  borderRadius: 22,
                  padding: 'clamp(12px, 3vw, 16px)',
                  color: '#FFFFFF',
                  boxShadow: '0 12px 36px rgba(15,23,42,0.18), 0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Camera Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                    ⚡ SENDRESQPLS CAMERA
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                </div>

                {/* Viewfinder Screen with Real Flood Photo */}
                <div className="onb-viewfinder">
                  {/* Gradient scrim for high contrast */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(0,0,0,0.0) 40%, rgba(15,23,42,0.85) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Viewfinder crosshairs */}
                  <div style={{ position: 'absolute', top: 8, left: 8, width: 12, height: 12, borderTop: '2.5px solid #2563EB', borderLeft: '2.5px solid #2563EB', zIndex: 2 }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderTop: '2.5px solid #2563EB', borderRight: '2.5px solid #2563EB', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: 8, left: 8, width: 12, height: 12, borderBottom: '2.5px solid #2563EB', borderLeft: '2.5px solid #2563EB', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, width: 12, height: 12, borderBottom: '2.5px solid #2563EB', borderRight: '2.5px solid #2563EB', zIndex: 2 }} />

                  {/* Center Reticle / Focus target */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -60%)',
                      width: 40,
                      height: 40,
                      border: '1.5px solid rgba(255,255,255,0.7)',
                      borderRadius: 6,
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />

                  {/* Spacer */}
                  <div style={{ zIndex: 2 }} />

                  {/* AI Detection Pill */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.96)',
                      color: '#0F172A',
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      zIndex: 2,
                      maxWidth: '92%',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>🌊</span> Flood Hazard Detected
                  </div>

                  {/* GPS Location & Resolution */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0 4px',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.92)',
                      fontWeight: 700,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      zIndex: 2,
                    }}
                  >
                    <span>📍 Balayan, Batangas</span>
                    <span>13.937° N, 120.734° E</span>
                  </div>
                </div>
              </div>
            )}

            {slide.type === 'map' && (
              <div
                className="onb-preview-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 22,
                  padding: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 12px 36px rgba(30,58,95,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1.5px solid #E2E8F0',
                  position: 'relative',
                }}
              >
                {/* Map mockup header */}
                <div
                  style={{
                    background: '#0F1F38',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaLocationDot size={13} color="#93C5FD" />
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>MDRRMO Command Center</span>
                  </div>
                  <span style={{ fontSize: 10, background: '#DC2626', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>LIVE</span>
                </div>

                {/* Map graphic container */}
                <div className="onb-map-graphic">
                  {/* Simulated map roads & route */}
                  <svg width="100%" height="100%" viewBox="0 0 260 120" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
                    <path d="M 20 100 Q 80 40 140 70 T 240 30" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="20" cy="100" r="6" fill="#DC2626" />
                    <circle cx="140" cy="70" r="5" fill="#2563EB" />
                    <circle cx="240" cy="30" r="7" fill="#16A34A" />
                  </svg>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      background: 'rgba(255,255,255,0.94)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#0F172A',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    📍 Balayan Emergency Grid
                  </div>
                </div>
              </div>
            )}

            {slide.type === 'status' && (
              <div
                className="onb-preview-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 22,
                  padding: 'clamp(14px, 3.2vw, 18px) clamp(12px, 3vw, 16px)',
                  boxShadow: '0 12px 36px rgba(30,58,95,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Active responder tracker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: '#F0FDF4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16A34A',
                      border: '1px solid #BBF7D0',
                      flexShrink: 0,
                    }}
                  >
                    <FaLocationDot size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Ambulance En Route
                    </div>
                    <div style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 700 }}>
                      Estimated Arrival: 3 mins
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: '#16A34A', borderRadius: 999 }} />
                </div>

                {/* Hotline pill */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>📞 MDRRMO Hotline</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2563EB' }}>0917-123-4567</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Dot Indicators ── */}
          <div className="onb-dots-wrap">
            {slides.map((_, i) => (
              <button
                key={i}
                className="onb-dot"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 22 : 8,
                  background: i === current ? '#2563EB' : '#CBD5E1',
                }}
              />
            ))}
          </div>

          {/* ── Action Buttons ── */}
          <div className="onb-btn-stack">
            {isLast ? (
              <>
                <Button
                  type="button"
                  className="onb-action-btn"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="onb-secondary-btn"
                  onClick={handleCreateAccount}
                >
                  Create an Account
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="onb-action-btn"
                onClick={goNext}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to check if onboarding should show
export function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}
