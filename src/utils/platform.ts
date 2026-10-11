import { Capacitor } from '@capacitor/core';

/**
 * Checks whether the current runtime is allowed to access mobile routes.
 * Native mobile apps are always allowed.
 * Regular web browsers are allowed on local development (localhost, 127.0.0.1, LAN IP)
 * so developers can test responsiveness across devices.
 */
export const isAllowedPlatform = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;
  // Lift ban for local development
  if (import.meta.env.DEV) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
    ) {
      return true;
    }
  }
  return false;
};
