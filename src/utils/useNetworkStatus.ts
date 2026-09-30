import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial status via native Capacitor Network plugin
    Network.getStatus()
      .then((status) => {
        if (isMounted) {
          setIsOnline(status.connected);
        }
      })
      .catch(() => {
        if (isMounted && typeof navigator !== 'undefined') {
          setIsOnline(navigator.onLine);
        }
      });

    // 2. Listen for native Android network changes
    let removeListener: (() => void) | null = null;
    Network.addListener('networkStatusChange', (status) => {
      if (isMounted) {
        setIsOnline(status.connected);
      }
    })
      .then((handle) => {
        removeListener = () => handle.remove();
      })
      .catch(() => {});

    // 3. Keep web event listeners as secondary fallback
    const handleOnline = () => {
      if (isMounted) setIsOnline(true);
    };
    const handleOffline = () => {
      if (isMounted) setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      if (removeListener) removeListener();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
