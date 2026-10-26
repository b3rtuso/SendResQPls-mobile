import { Capacitor } from '@capacitor/core';

/**
 * Checks if the current browser environment is running on a local network (LAN / localhost).
 */
export const isLocalNetwork = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;

  const hostname = window.location.hostname.toLowerCase();
  
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return true;
  }

  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  const match172 = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (match172) {
    const secondOctet = parseInt(match172[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

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
 * Whether the user is running inside the native Android or iOS Capacitor APK.
 */
export const isNativeApp = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;
  if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('sendresqpls')) {
    return true;
  }
  return false;
};

/**
 * Whether the web app is running in installed PWA/WPA standalone mode or with WPA flag.
 */
export const isStandalonePwa = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('source=pwa') ||
    window.location.search.includes('source=wpa') ||
    window.location.search.includes('mode=pwa') ||
    window.location.search.includes('mode=wpa')
  );
};

/**
 * Whether the user is on iOS Safari (to show "Add to Home Screen" instructions).
 */
export const isIosSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isWebkit = /safari/.test(ua) && !/chrome|crios|fxios|edgios/.test(ua);
  return isIos && isWebkit;
};

/**
 * Checks if running on an Apple device (iPhone, iPad, iPod).
 */
export const isIosDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
};

/**
 * Determines whether access to the mobile directory is permitted.
 * - Allowed: Local development/LAN testing.
 * - Allowed: Native Android / iOS APK.
 * - Allowed: Installed WPA running in standalone mode (from Home Screen or launcher).
 * - Allowed: Dedicated WPA domain / deployment (hostname contains 'wpa' or 'pwa', or VITE_IS_WPA=true).
 * - Blocked: Standard web browser tab visiting the main SendResQPls mobile link.
 */
export const isAllowedPlatform = (): boolean => {
  // 1. Localhost / LAN development
  if (isLocalNetwork()) return true;

  // 2. Native mobile APK
  if (isNativeApp()) return true;

  // 3. Installed WPA in standalone mode
  if (isStandalonePwa()) return true;

  // 4. Dedicated WPA domain or explicit VITE_IS_WPA flag
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('wpa') || hostname.includes('pwa')) {
      return true;
    }
  }
  if (import.meta.env.VITE_IS_WPA === 'true' || import.meta.env.VITE_IS_PWA === 'true') {
    return true;
  }

  // 5. Standard browser tab on main mobile link is blocked
  return false;
};
