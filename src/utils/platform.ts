import { Capacitor } from '@capacitor/core';

/**
 * Checks if the current browser environment is running on a local network (LAN / localhost).
 * Allows developers, QA testers, and local devices (phones/tablets on the same Wi-Fi)
 * to access the mobile web app and test responsiveness directly in browser.
 */
export const isLocalNetwork = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;

  const hostname = window.location.hostname.toLowerCase();
  
  // Loopback / Localhost
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return true;
  }

  // 192.168.0.0/16 (Common home and office Wi-Fi LANs)
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  // 10.0.0.0/8 (Hotspot / Enterprise LANs)
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255 private ranges)
  const match172 = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (match172) {
    const secondOctet = parseInt(match172[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  // Common local mDNS / LAN domain suffixes
  if (
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.test')
  ) {
    return true;
  }

  return false;
};

/**
 * Determines whether access to the mobile directory is permitted.
 * - Allowed if running inside native Capacitor APK (Android / iOS)
 * - Allowed if custom User-Agent token 'sendresqpls' is detected
 * - Allowed if accessed over the local network (localhost, 192.168.x.x, 10.x.x.x, etc.) in a browser
 */
export const isAllowedPlatform = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;
  if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('sendresqpls')) {
    return true;
  }
  if (isLocalNetwork()) {
    return true;
  }
  return false;
};
