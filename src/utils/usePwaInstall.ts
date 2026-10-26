import { useState, useEffect, useCallback } from 'react';
import { isNativeApp, isStandalonePwa, isIosSafari } from './platform';

export const APK_DOWNLOAD_URL = 'https://github.com/b3rtuso/SendResQPls-mobile/releases/latest/download/SendResQPls.apk';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ── Global Singleton: Catch beforeinstallprompt at page load before React renders ──
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('srq-pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent('srq-pwa-installed'));
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandalonePwa());
  const [isNative, setIsNative] = useState<boolean>(() => isNativeApp());
  const [isIos, setIsIos] = useState<boolean>(() => isIosSafari());
  const [isAndroid, setIsAndroid] = useState<boolean>(() => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent));

  useEffect(() => {
    setIsNative(isNativeApp());
    setIsInstalled(isStandalonePwa());
    setIsIos(isIosSafari());
    setIsAndroid(typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent));

    const handleInstallable = () => {
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('srq-pwa-installable', handleInstallable);
    window.addEventListener('srq-pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('srq-pwa-installable', handleInstallable);
      window.removeEventListener('srq-pwa-installed', handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return 'unavailable';
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    canInstall: !isNative && !isInstalled,
    deferredPromptAvailable: deferredPrompt !== null || globalDeferredPrompt !== null,
    isInstalled,
    isNative,
    isIos,
    isAndroid,
    promptInstall,
    apkDownloadUrl: APK_DOWNLOAD_URL,
  };
}
