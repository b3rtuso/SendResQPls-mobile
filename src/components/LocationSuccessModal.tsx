import { useState, useEffect, useRef } from 'react';
import { FaLocationDot } from 'react-icons/fa6';
import { Check } from 'lucide-react';

export default function LocationSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleLocationEnabled = () => {
      setIsOpen(true);
      // Auto dismiss after 6 seconds if user doesn't tap
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 6000);
    };

    window.addEventListener('srq-location-enabled', handleLocationEnabled);

    return () => {
      window.removeEventListener('srq-location-enabled', handleLocationEnabled);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleClose = () => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'locOverlayFade 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes locOverlayFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes locModalPop {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes locPulseRing {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 340,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          padding: '28px 22px 22px',
          textAlign: 'center',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 10px 20px -5px rgba(15, 23, 42, 0.1)',
          animation: 'locModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Glowing emerald badge with location pin & checkmark */}
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            animation: 'locPulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '2px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
          }}>
            <FaLocationDot size={28} color="#059669" />
            <div style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#10B981',
              border: '2.5px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
            }}>
              <Check size={13} strokeWidth={3.5} color="#FFFFFF" />
            </div>
          </div>
        </div>

        <h2 style={{
          color: '#0F1F38',
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.25,
          margin: '0 0 10px',
          letterSpacing: '-0.3px',
        }}>
          Location Successfully<br />Turned On
        </h2>

        <p style={{
          color: '#64748B',
          fontSize: 13.5,
          lineHeight: 1.5,
          margin: '0 0 24px',
          padding: '0 6px',
        }}>
          Your device GPS is now active. High-accuracy coordinates are ready for emergency response.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            transition: 'opacity 0.15s ease',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
