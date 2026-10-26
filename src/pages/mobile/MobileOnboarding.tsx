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
    <div className="w-full min-h-screen flex flex-col bg-[#F1F5F9] mobile-auth-transition">
      <style>{`
        /* Full-Width Spanning Header */
        .onb-header {
          background:
            radial-gradient(circle 100px at calc(100% - 40px) 20px, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 99%, transparent 100%),
            linear-gradient(160deg, #0F1F38 0%, #1D4ED8 60%, #2563EB 100%);
          position: relative;
          box-shadow: 0 6px 24px rgba(15, 31, 56, 0.35);
          border-radius: 0 0 24px 24px;
          color: white;
          z-index: 10;
        }
        @media (min-width: 640px) {
          .onb-header {
            border-radius: 0 0 32px 32px;
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

        /* Viewfinder screen inside Camera preview */
        .onb-viewfinder {
          height: clamp(140px, 22vh, 190px);
          border-radius: 16px;
          background-image: url(/flood_sample.jpg);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.55);
        }

        /* Map graphic container */
        .onb-map-graphic {
          height: clamp(120px, 18vh, 160px);
          border-radius: 16px;
          background: #E2E8F0;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Simple Lighting-up 3 Dots */
        .onb-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
        }
        .onb-dot.active {
          background-color: #2563EB;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.65), 0 0 3px rgba(37, 99, 235, 0.9);
          transform: scale(1.15);
          opacity: 1;
        }
        .onb-dot.inactive {
          background-color: #CBD5E1;
          box-shadow: none;
          transform: scale(1);
          opacity: 0.65;
        }
        .onb-dot.inactive:hover {
          opacity: 0.9;
        }

        /* Responsive Buttons */
        .onb-action-btn {
          width: 100%;
          min-height: clamp(44px, 6vh, 50px);
          padding: clamp(12px, 2vh, 16px);
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
          min-height: clamp(44px, 6vh, 50px);
          padding: clamp(11px, 1.8vh, 15px);
          background: #FFFFFF;
          color: #0F172A;
          border: 1.5px solid #CBD5E1;
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
          border-color: #94A3B8;
        }
        .onb-secondary-btn:active {
          background: #F1F5F9;
          transform: scale(0.98);
        }
      `}</style>

      {/* ── 1. Full-Width Spanning Header ── */}
      <header className="w-full onb-header px-4 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6">
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="SRQ Logo"
              style={{
                width: 'clamp(32px, 8vw, 42px)',
                height: 'clamp(32px, 8vw, 42px)',
                borderRadius: 12,
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 'clamp(9px, 2.2vw, 10.5px)', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                MDRRMO Balayan
              </div>
              <div style={{ fontSize: 'clamp(14px, 3.5vw, 17px)', color: '#FFFFFF', fontWeight: 900, letterSpacing: '-0.3px', lineHeight: 1.15 }}>
                SendResQPls
              </div>
            </div>
          </div>

          {!isLast ? (
            <button
              onClick={skip}
              type="button"
              aria-label="Skip onboarding"
              className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs tracking-wider uppercase transition border border-white/25 shadow-sm min-h-[36px]"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={handleGetStarted}
              type="button"
              aria-label="Proceed to login"
              className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs tracking-wider uppercase transition border border-white/30 shadow-sm min-h-[36px]"
            >
              Done
            </button>
          )}
        </div>
      </header>

      {/* ── 2. Fluid Responsive Content Main Container ── */}
      <main
        className="w-full flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:border sm:border-slate-200/80 p-6 sm:p-8 md:p-10 relative z-10 flex flex-col justify-between">
          <div key={current} className="onb-content-animate grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left Column (Text, Category & Description) */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: slide.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: `0 2px 10px ${slide.accentColor}40`,
                    flexShrink: 0,
                  }}
                >
                  <BadgeIcon size={17} strokeWidth={2.4} />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: slide.accentColor,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {slide.category}
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 32px)',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.18,
                margin: '0 0 10px',
              }}>
                {slide.title}
              </h1>

              <div
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 4,
                  background: slide.accentColor,
                  marginBottom: 14,
                }}
              />

              <p style={{
                fontSize: 'clamp(13px, 3.2vw, 15px)',
                color: '#64748B',
                lineHeight: 1.6,
                margin: '0 0 16px',
              }}>
                {slide.subtitle}
              </p>

              {/* Action Buttons on Tablet & Desktop (Inline with left column) */}
              <div className="hidden md:flex flex-col gap-3 mt-4">
                {isLast ? (
                  <div className="flex flex-col gap-3 w-full">
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
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="onb-action-btn"
                    onClick={goNext}
                  >
                    Next Step
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column (Visual Feature Preview) */}
            <div className="flex flex-col items-center justify-center w-full">
              {slide.type === 'camera' && (
                <div
                  className="w-full max-w-[380px] sm:max-w-[420px] bg-[#0F172A] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-white shadow-xl border border-slate-700/50"
                >
                  {/* Camera Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em' }}>
                      ⚡ SENDRESQPLS CAMERA
                    </span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  </div>

                  {/* Viewfinder Screen */}
                  <div className="onb-viewfinder">
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(0,0,0,0.0) 40%, rgba(15,23,42,0.85) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Crosshairs */}
                    <div style={{ position: 'absolute', top: 8, left: 8, width: 12, height: 12, borderTop: '2.5px solid #2563EB', borderLeft: '2.5px solid #2563EB', zIndex: 2 }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderTop: '2.5px solid #2563EB', borderRight: '2.5px solid #2563EB', zIndex: 2 }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, width: 12, height: 12, borderBottom: '2.5px solid #2563EB', borderLeft: '2.5px solid #2563EB', zIndex: 2 }} />
                    <div style={{ position: 'absolute', bottom: 8, right: 8, width: 12, height: 12, borderBottom: '2.5px solid #2563EB', borderRight: '2.5px solid #2563EB', zIndex: 2 }} />

                    {/* Focus Reticle */}
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

                    <div style={{ zIndex: 2 }} />

                    {/* AI Detection Pill */}
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.96)',
                        color: '#0F172A',
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        zIndex: 2,
                        maxWidth: '94%',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ fontSize: 13 }}>🌊</span> Flood Hazard Detected
                    </div>

                    {/* GPS Coordinates */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0 4px',
                        fontSize: 10.5,
                        color: 'rgba(255,255,255,0.95)',
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
                  className="w-full max-w-[380px] sm:max-w-[420px] bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl border border-slate-200"
                >
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

                  <div className="onb-map-graphic">
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
                        background: 'rgba(255,255,255,0.95)',
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
                  className="w-full max-w-[380px] sm:max-w-[420px] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200 flex flex-col gap-3.5"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
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
                      <FaLocationDot size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Ambulance En Route
                      </div>
                      <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>
                        Estimated Arrival: 3 mins
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#16A34A', borderRadius: 999 }} />
                  </div>

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
          </div>

          {/* ── 3. Simple Lit-Up 3 Dots & Mobile Action Buttons ── */}
          <div className="mt-6 md:mt-8 pt-4 border-t border-slate-100 flex flex-col items-center">
            {/* The 3 Dots — simple, circular, active dot simply lights up */}
            <div className="flex items-center justify-center gap-2.5 mb-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`onb-dot ${i === current ? 'active' : 'inactive'}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons for Mobile (< 768px) */}
            <div className="flex md:hidden flex-col gap-3 w-full max-w-sm mx-auto">
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
      </main>

      {/* ── 3. Bottom Branding Footer ── */}
      <footer className="w-full text-center py-4 text-xs text-slate-400">
        MDRRMO Balayan, Batangas · SendResQPls v2
      </footer>
    </div>
  );
}

// Helper to check if onboarding should show
export function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}
