import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PlusSquare, X, Share, MoreVertical, CheckCircle2 } from 'lucide-react';
import { usePwaInstall } from '../utils/usePwaInstall';

export default function PwaInstallBanner() {
  const { deferredPromptAvailable, isInstalled, isNative, isIos, promptInstall } = usePwaInstall();
  const location = useLocation();

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('srq_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Auto-hide on specific utility routes like /get-the-app or /reset-password
  const isUtilityRoute = location.pathname.includes('reset-password') || location.pathname.includes('get-the-app');

  useEffect(() => {
    if (isInstalled) {
      setShowInstructionsModal(false);
    }
  }, [isInstalled]);

  if (isNative || isInstalled || dismissed || isUtilityRoute) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('srq_pwa_banner_dismissed', 'true');
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const handleInstallClick = async () => {
    if (deferredPromptAvailable) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          handleDismiss();
        }, 2500);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  // Has bottom navigation if on an authenticated mobile tab
  const hasBottomNav = !['/mobile/login', '/mobile/signup', '/mobile/forgot-password', '/mobile/onboarding', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      <style>{`
        @keyframes pwaSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pwaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Floating Add to Home Screen Banner */}
      <aside
        role="region"
        aria-label="Install SendResQPls to Home Screen"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: hasBottomNav ? 'clamp(68px, 10vh, 80px)' : 'clamp(14px, 3vh, 24px)',
          zIndex: 9998,
          padding: '0 clamp(12px, 3vw, 24px)',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          animation: 'pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 520,
            background: 'linear-gradient(135deg, #0F1F38 0%, #172E54 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 18,
            padding: '12px 14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#FFFFFF',
          }}
        >
          {/* Official System Logo */}
          <img
            src="/icon-192.png"
            alt="SendResQPls"
            width={44}
            height={44}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.svg';
            }}
            style={{
              borderRadius: 12,
              objectFit: 'cover',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              flexShrink: 0,
            }}
          />

          {/* Text block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 'clamp(13px, 3.6vw, 14.5px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.2px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>Add to Home Screen</span>
              <span style={{
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.4px',
                padding: '1px 5px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}>
                PWA
              </span>
            </div>
            <div style={{
              fontSize: 'clamp(11px, 3vw, 12px)',
              color: 'rgba(255, 255, 255, 0.78)',
              marginTop: 2,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {installSuccess ? 'App installed successfully!' : '1-tap access and offline emergency reporting'}
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {installSuccess ? (
              <div style={{
                background: 'rgba(34, 197, 94, 0.25)',
                border: '1px solid #22C55E',
                color: '#4ADE80',
                padding: '7px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <CheckCircle2 size={15} /> Added
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 13px',
                  fontSize: 'clamp(12px, 3.2vw, 13px)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                <PlusSquare size={15} /> Install
              </button>
            )}

            {/* Dismiss X */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                borderRadius: 8,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Step-by-Step Instructions Modal (For iOS Safari or Chrome when automatic prompt is unavailable) */}
      {showInstructionsModal && (
        <div
          onClick={() => setShowInstructionsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'pwaFadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#FFFFFF',
              borderRadius: 24,
              padding: '24px 20px',
              textAlign: 'center',
              color: '#0F172A',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Header Icon */}
            <div style={{ display: 'inline-block', marginBottom: 12 }}>
              <img
                src="/icon-192.png"
                alt="SendResQPls"
                width={56}
                height={56}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                }}
                style={{
                  borderRadius: 14,
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  objectFit: 'cover',
                }}
              />
            </div>

            <h3 style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 6px',
            }}>
              Add to Home Screen
            </h3>
            <p style={{
              fontSize: 13,
              color: '#64748B',
              margin: '0 0 20px',
              lineHeight: 1.45,
            }}>
              Install SendResQPls directly onto your device screen for instant 1-tap emergency access.
            </p>

            {/* Instruction Steps */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {isIos ? (
                <>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>1</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Tap the <strong>Share</strong> button <Share size={14} style={{ display: 'inline', verticalAlign: '-2px', color: '#2563EB' }} /> at the bottom of Safari.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>2</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>3</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Tap <strong>Add</strong> in the top right corner to confirm.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>1</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Tap the browser menu <MoreVertical size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> in Chrome / Edge.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>2</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF',
                      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>3</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      Tap <strong>Install</strong> to add the app icon to your phone screen.
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
