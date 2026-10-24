import { useState, useEffect } from 'react';
import { isNativeApp, isStandalonePwa, isIosSafari } from './platform';

export const APK_DOWNLOAD_URL = 'https://github.com/b3rtuso/SendResQPls-mobile/releases/latest/download/SendResQPls.apk';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isNative, setIsNative] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    setIsNative(isNativeApp());
    setIsInstalled(isStandalonePwa());
    setIsIos(isIosSafari());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  };

  return {
    canInstall: !isNative && !isInstalled && (deferredPrompt !== null || isIos),
    deferredPromptAvailable: deferredPrompt !== null,
    isInstalled,
    isNative,
    isIos,
    promptInstall,
    apkDownloadUrl: APK_DOWNLOAD_URL,
  };
}
