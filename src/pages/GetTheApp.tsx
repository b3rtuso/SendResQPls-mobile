import { useState, useEffect } from 'react';
import { Smartphone, ArrowRight, Download, Share, PlusSquare, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePwaInstall } from '../utils/usePwaInstall';

export default function GetTheApp() {
  const navigate = useNavigate();
  const { canInstall, deferredPromptAvailable, isInstalled, isNative, isIos, promptInstall, apkDownloadUrl } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside native Capacitor APK, proceed to home / login
  useEffect(() => {
    if (isNative) {
      navigate('/mobile', { replace: true });
    }
  }, [isNative, navigate]);

  const handleInstallClick = async () => {
    if (deferredPromptAvailable) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // In browsers without deferred prompt support, inform user or navigate to app
      navigate('/mobile');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0F1F38 0%, #172554 40%, #1E3A8A 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 24,
          padding: '36px 24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-block', marginBottom: 16 }}>
          <img
            src="/icon-192.png"
            alt="SendResQPls"
            width={76}
            height={76}
            style={{
              borderRadius: 20,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              objectFit: 'cover',
            }}
          />
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: '#93C5FD', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>
          MDRRMO Balayan, Batangas
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.3px' }}>
          SendResQPls
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, margin: '0 0 24px' }}>
          Instant disaster emergency reporting and response. Available as an installable Progressive Web App (PWA) and native Android APK.
        </p>

        {installSuccess ? (
          <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4ADE80', fontWeight: 800, fontSize: 15 }}>
              <CheckCircle2 size={20} /> App Installed Successfully!
            </div>
            <p style={{ fontSize: 12.5, color: '#FFFFFF', margin: '8px 0 0' }}>
              Launch SendResQPls from your device home screen anytime.
            </p>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {/* Primary Action 1: Open / Continue to Web App */}
          <button
            onClick={() => navigate('/mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '14px 20px',
              borderRadius: 14,
              border: 'none',
              background: '#2563EB',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              transition: 'all 0.18s',
            }}
          >
            <Smartphone size={19} /> Open Web App <ArrowRight size={17} />
          </button>

          {/* Action 2: Install PWA (if supported and not already standalone) */}
          {!isInstalled && (canInstall || deferredPromptAvailable) && (
            <button
              onClick={handleInstallClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                padding: '13px 20px',
                borderRadius: 14,
                border: '1.5px solid rgba(147, 197, 253, 0.6)',
                background: 'rgba(37, 99, 235, 0.25)',
                color: '#FFFFFF',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              <PlusSquare size={18} color="#93C5FD" /> Install to Home Screen (PWA)
            </button>
          )}

          {/* Action 3: Download Android APK */}
          <a
            href={apkDownloadUrl}
            download="SendResQPls.apk"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '13px 20px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.18s',
            }}
          >
            <Download size={17} /> Download Android APK (.apk)
          </a>
        </div>

        {/* iOS Step-by-Step Instructions Modal / Accordion */}
        {showIosGuide && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: 20,
              textAlign: 'left',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 800, color: '#93C5FD', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share size={15} /> How to Install on iOS (Safari):
            </div>
            <ol style={{ paddingLeft: 20, margin: 0, color: 'rgba(255,255,255,0.9)' }}>
              <li>Tap the <strong>Share</strong> button at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Tap <strong>"Add"</strong> in the top right corner.</li>
            </ol>
          </div>
        )}

        <div
          style={{
            padding: '14px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <PhoneCall size={20} color="#F87171" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FCA5A5' }}>
              Immediate Emergency Hotline
            </div>
            <a
              href="tel:911"
              style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', textDecoration: 'none' }}
            >
              Dial 911 / (043) 211-4111
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
        &copy; 2026 MDRRMO Balayan &bull; SendResQPls v2 PWA &amp; APK
      </div>
    </div>
  );
}
