import { Smartphone, ExternalLink, Globe, ArrowRight } from 'lucide-react';
import { isLocalNetwork } from '../utils/platform';

export default function WebBrowserBlocked() {
  const local = isLocalNetwork();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0F1F38',
      color: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 'min(480px, calc(100vw - 32px))',
        width: '100%',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '20px',
        padding: 'clamp(24px, 6vw, 36px) clamp(18px, 5vw, 28px)',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo / Shield */}
        <div style={{
          width: 'clamp(64px, 16vw, 76px)',
          height: 'clamp(64px, 16vw, 76px)',
          borderRadius: '18px',
          overflow: 'hidden',
          margin: '0 auto 16px auto',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          background: '#0F1F38',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/logo.jpg"
            alt="SendResQPls"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#93C5FD',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>
          WPA or Mobile App Required
        </span>

        <h1 style={{
          fontSize: 'clamp(18px, 5vw, 22px)',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '10px',
          lineHeight: 1.3
        }}>
          SendResQPls Emergency App
        </h1>

        <p style={{
          fontSize: 'clamp(12.5px, 3.5vw, 13.5px)',
          color: '#94A3B8',
          lineHeight: 1.6,
          marginBottom: '24px'
        }}>
          Direct browser access on this mobile link is restricted. Citizen emergency reporting requires the official SendResQPls WPA (Web App) or the native Android APK package.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Primary Action 1: Open Official WPA */}
          <a
            href="https://sendresqpls---wpa.vercel.app/mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: 'clamp(12px, 3vw, 14px) 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: 'clamp(13px, 3.5vw, 14px)',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'background 0.15s ease'
            }}
          >
            <Globe size={18} />
            Open Official WPA (Web App) <ArrowRight size={16} />
          </a>

          {/* Primary Action 2: Download Android APK */}
          <a
            href="/get-the-app"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: 'clamp(12px, 3vw, 14px) 20px',
              backgroundColor: '#1E293B',
              border: '1.5px solid #3B82F6',
              color: '#93C5FD',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: 'clamp(13px, 3.5vw, 14px)',
              textDecoration: 'none',
              transition: 'background 0.15s ease'
            }}
          >
            <Smartphone size={18} />
            Download Android APK (.apk)
          </a>

          {/* Localhost / LAN Developer Bypass */}
          {local && (
            <a
              href="/mobile/login?dev=1"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px dashed #475569',
                color: '#94A3B8',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '12px',
                textDecoration: 'none',
                marginTop: '4px'
              }}
            >
              Continue on Local Network (Dev Bypass) <ArrowRight size={14} />
            </a>
          )}

          <a
            href="https://sendresqpls-landing.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#64748B',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: '4px'
            }}
          >
            <ExternalLink size={14} />
            MDRRMO Information Portal
          </a>
        </div>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #334155',
          fontSize: '11.5px',
          color: '#64748B'
        }}>
          MDRRMO Balayan Municipal Disaster Risk Reduction and Management Office
        </div>
      </div>
    </div>
  );
}
