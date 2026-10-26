import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { FaBell } from 'react-icons/fa';
import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getWebNotificationPermission,
  requestWebNotificationPermission,
  showSystemNotification,
} from '../utils/pushNotificationHelper';
import { playNotificationSound } from '../utils/notificationSettings';

interface NotificationPermissionStripProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function NotificationPermissionStrip({ className, style }: NotificationPermissionStripProps) {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(() => getWebNotificationPermission());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const sync = () => setPerm(getWebNotificationPermission());
    window.addEventListener('srq-web-notif-permission', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('srq-web-notif-permission', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  if (Capacitor.isNativePlatform() || perm === 'granted' || perm === 'unsupported') {
    return null;
  }

  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
  const isIosTab = isIos && !isStandalone;

  const handleEnable = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requesting) return;
    setRequesting(true);
    try {
      const res = await requestWebNotificationPermission();
      setPerm(res);
      if (res === 'granted') {
        playNotificationSound(true);
        await showSystemNotification({
          title: '✅ Notification Center Connected',
          body: 'You will now receive MDRRMO Balayan emergency status updates in your phone Notification Center.',
          tag: 'srq-connected-' + Date.now(),
          url: '/mobile/notifications',
          force: true,
        });
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 ${className || ''}`} style={style}>
      <div
        className="max-w-xl mx-auto"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: 'clamp(11px, 2.8vw, 14px) clamp(12px, 3.5vw, 16px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2.5vw, 12px)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* Status dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            flexShrink: 0,
            background: perm === 'denied' ? '#DC2626' : '#2563EB',
            boxShadow: perm === 'denied' ? '0 0 0 3px rgba(220,38,38,0.18)' : '0 0 0 3px rgba(37,99,235,0.18)',
          }}
        />

        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'clamp(11.5px, 3.2vw, 12.5px)',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.1px',
              marginBottom: 2,
            }}
          >
            {isIosTab
              ? 'iPhone Notification Setup'
              : perm === 'denied'
              ? 'Browser notifications blocked'
              : 'Notification Center alerts off'}
          </div>
          <div style={{ fontSize: 'clamp(10.5px, 2.8vw, 11.5px)', color: '#64748B', lineHeight: 1.4 }}>
            {isIosTab
              ? 'Apple requires adding to Home Screen: tap Share (↑) → "Add to Home Screen" to receive notifications.'
              : perm === 'denied'
              ? 'Tap the tune/lock icon in Brave/Chrome address bar to allow Notifications.'
              : 'Tap to enable alerts in your phone Notification Center.'}
          </div>
        </div>

        {/* Action Button */}
        {isIosTab ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: 'clamp(5px, 1.5vw, 7px) clamp(8px, 2.5vw, 10px)',
              borderRadius: 8,
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: 'clamp(10px, 2.8vw, 11px)',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Share size={12} /> Share &gt; Add
          </div>
        ) : (
          perm === 'default' && (
            <Button
              size="sm"
              disabled={requesting}
              onClick={handleEnable}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: 'clamp(5px, 1.5vw, 7px) clamp(8px, 2.5vw, 12px)',
                borderRadius: 8,
                height: 'auto',
                background: requesting ? '#1D4ED8' : '#2563EB',
                border: 'none',
                color: 'white',
                fontSize: 'clamp(11px, 3vw, 12px)',
                fontWeight: 700,
                whiteSpace: 'nowrap' as const,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)',
                cursor: 'pointer',
              }}
            >
              <FaBell size={12} /> Enable Alerts
            </Button>
          )
        )}
      </div>
    </div>
  );
}
