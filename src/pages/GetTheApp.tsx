import { Smartphone, ArrowRight, KeyRound, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GetTheApp() {
  const navigate = useNavigate();

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
          maxWidth: 440,
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
            src="/logo.jpg"
            alt="SendResQPls"
            width={72}
            height={72}
            style={{
              borderRadius: 18,
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
          SendResQPls App
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: '0 0 28px' }}>
          The SendResQPls citizen emergency dispatch and location tracking portal is optimized for the native Android mobile app.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => navigate('/mobile/login')}
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
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              transition: 'all 0.18s',
            }}
          >
            <Smartphone size={18} /> Continue to Web App <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate('/reset-password')}
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
              transition: 'all 0.18s',
            }}
          >
            <KeyRound size={17} /> Reset Account Password
          </button>
        </div>

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
        &copy; 2026 MDRRMO Balayan &bull; SendResQPls v2
      </div>
    </div>
  );
}
