import { ShieldAlert, Smartphone, ExternalLink } from 'lucide-react';

export default function WebBrowserBlocked() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: '#EF4444'
        }}>
          <ShieldAlert size={36} />
        </div>

        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#FCA5A5',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '12px'
        }}>
          Mobile App Required
        </span>

        <h1 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '12px',
          lineHeight: 1.3
        }}>
          SendResQPls Emergency App
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          Direct web browser access is restricted. The citizen emergency dispatch system requires verified hardware sensors, GPS geolocation, and native background push alerts available only via the official Android APK.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <a
            href="https://github.com/b3rtuso/SendResQPls/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Smartphone size={18} />
            Download Official Android APK
          </a>

          <a
            href="https://sendresqpls-landing.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: '#CBD5E1',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <ExternalLink size={16} />
            Visit Information Portal
          </a>
        </div>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #334155',
          fontSize: '12px',
          color: '#64748B'
        }}>
          MDRRMO Balayan Municipal Disaster Risk Reduction and Management Office
        </div>
      </div>
    </div>
  );
}