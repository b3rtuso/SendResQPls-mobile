import { PushNotifications } from '@capacitor/push-notifications';
import { updateProfile } from '../api/client';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { addNotification } from '../pages/mobile/MobileNotifications';
import { shouldShowNotification, type NotificationCategory } from './notificationSettings';

// Custom event name used to broadcast incoming FCM notifications to the UI
export const FCM_FOREGROUND_EVENT = 'srq-push-foreground';
export const INCIDENT_SYNC_EVENT = 'srq-incident-status-synced';

export interface FcmNotificationPayload {
  title: string;
  body: string;
  incidentId?: string;
  status?: string;
  type?: string;
  department?: string;
}

// ── Pending route store ──────────────────────────────────────────────────────
// When the app is killed and the user taps a notification, Capacitor fires
// pushNotificationActionPerformed before React Router is ready. We store the
// intended route here and consume it once the router mounts.
let _pendingRoute: string | null = null;

export function setPendingRoute(path: string) {
  _pendingRoute = path;
}

/** Called by RouterAwareNotificationSetup on mount — consumes the route once. */
export function consumePendingRoute(): string | null {
  const r = _pendingRoute;
  _pendingRoute = null;
  return r;
}

// ── Router callback registry ─────────────────────────────────────────────────
// RouterAwareNotificationSetup (inside React Router) registers its navigate fn
// here so the push listener can trigger in-app navigation without a page reload.
let _navigate: ((path: string) => void) | null = null;

export function registerPushNavigate(fn: (path: string) => void) {
  _navigate = fn;
}

export function unregisterPushNavigate() {
  _navigate = null;
}

/** Navigate using React Router if mounted, otherwise store as pending route. */
function pushRoute(path: string) {
  if (_navigate) {
    _navigate(path);
  } else {
    // App not yet mounted (cold start) — store for deferred navigation
    setPendingRoute(path);
    // Fallback: if SPA hasn't loaded at all, use location.href
    if (!document.getElementById('root')?.hasChildNodes()) {
      window.location.href = path;
    }
  }
}

// ── Web / PWA Notification Center Support ────────────────────────────────────
let _swMessageListenerAttached = false;
let _gestureListenerAttached = false;
const _activeWebNotifications: any[] = [];
const _recentSystemNotifs = new Map<string, number>();

function ensureServiceWorkerClickBridge() {
  if (_swMessageListenerAttached) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  _swMessageListenerAttached = true;

  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'NOTIFICATION_CLICK' && typeof data.url === 'string') {
      pushRoute(data.url);
    }
  });
}

export function getWebNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests browser Notification permission so the PWA can post alerts to the
 * phone/OS Notification Center (System Tray / Status Bar).
 * Uses a clean click/touchend gesture listener which is fully supported by Brave, Chrome, and Safari.
 */
export async function requestWebNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (Capacitor.isNativePlatform()) return 'granted';
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  ensureServiceWorkerClickBridge();

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  try {
    const result = await Notification.requestPermission();
    window.dispatchEvent(new CustomEvent('srq-web-notif-permission', { detail: result }));
    if (result !== 'default') {
      return result;
    }
  } catch {
    // Legacy callback fallback
    try {
      Notification.requestPermission((res) => {
        window.dispatchEvent(new CustomEvent('srq-web-notif-permission', { detail: res }));
      });
    } catch {}
  }

  // Brave, Chrome, and iOS Safari require a direct user click/touch gesture
  // to display the permission dialog. Attach a one-time gesture listener.
  if (Notification.permission === 'default' && !_gestureListenerAttached) {
    _gestureListenerAttached = true;
    const onUserActivation = async () => {
      window.removeEventListener('click', onUserActivation, true);
      window.removeEventListener('touchend', onUserActivation, true);
      _gestureListenerAttached = false;
      if (Notification.permission === 'default') {
        try {
          const res = await Notification.requestPermission();
          window.dispatchEvent(new CustomEvent('srq-web-notif-permission', { detail: res }));
        } catch {}
      }
    };
    window.addEventListener('click', onUserActivation, { once: true, capture: true });
    window.addEventListener('touchend', onUserActivation, { once: true, capture: true });
  }

  return Notification.permission;
}

export interface SystemNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  incidentId?: string;
  category?: NotificationCategory;
  force?: boolean;
}

function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Universal System Notification Engine:
 * Posts directly to the Phone / OS Notification Center (System Tray / Status Bar)
 * on BOTH the Native Android App (via native NotificationManager) AND
 * the Web Browser / PWA (via ServiceWorker / Web Notification),
 * even while the browser or mobile app is open on screen!
 */
export async function showSystemNotification(options: SystemNotificationOptions): Promise<boolean> {
  if (!options.force && !shouldShowNotification(options.category || 'status')) {
    return false;
  }

  // Deduplication check: prevent duplicate popups within 3.5s
  const now = Date.now();
  const dedupKey = `${options.incidentId || ''}-${options.title}-${options.body}`;
  _recentSystemNotifs.forEach((time, k) => {
    if (now - time > 10000) _recentSystemNotifs.delete(k);
  });
  const lastFired = _recentSystemNotifs.get(dedupKey);
  if (lastFired && now - lastFired < 3500) {
    return false;
  }
  _recentSystemNotifs.set(dedupKey, now);

  const targetUrl = options.url || (options.incidentId ? `/mobile/history?incidentId=${options.incidentId}` : '/mobile/notifications');

  // ── 1. NATIVE ANDROID MOBILE APP PATH ──────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    try {
      const LocationAccuracy = registerPlugin<any>('LocationAccuracy');
      if (LocationAccuracy && typeof LocationAccuracy.showLocalNotification === 'function') {
        await LocationAccuracy.showLocalNotification({
          title: options.title,
          body: options.body,
          route: targetUrl,
          id: stringHashCode(options.title + (options.incidentId || '')) % 100000,
        });
        return true;
      }
    } catch (nativeErr) {
      console.warn('[NativeNotification] Native showLocalNotification error:', nativeErr);
    }
    return false;
  }

  // ── 2. WEB BROWSER / PWA PATH (Brave, Chrome, Edge, Safari) ─────────────────
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  ensureServiceWorkerClickBridge();

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Unique tag per alert ensures OS Notification Center stacks every alert and
  // never suppresses repeated status updates even while the browser is open
  const uniqueTag = options.tag || `srq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const notifIcon = `${window.location.origin}/icon-192.png`;

  const notifPayload: NotificationOptions & Record<string, any> = {
    body: options.body,
    icon: notifIcon,
    badge: notifIcon,
    tag: uniqueTag,
    renotify: true,
    vibrate: [200, 100, 200],
    silent: false,
    data: {
      url: targetUrl,
      incidentId: options.incidentId,
      timestamp: Date.now(),
    },
  };

  // Primary Web Path: ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      let reg: ServiceWorkerRegistration | undefined;
      // Wait up to 1200ms for ready
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1200));
      reg = await Promise.race([readyPromise, timeoutPromise]);

      if (!reg) {
        reg = await navigator.serviceWorker.getRegistration();
      }
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(options.title, notifPayload);
        return true;
      }
    } catch (swErr) {
      console.warn('[WebNotif] SW showNotification fallback:', swErr);
    }
  }

  // Desktop / Brave fallback: new Notification()
  try {
    const n = new Notification(options.title, {
      body: options.body,
      icon: notifIcon,
      tag: uniqueTag,
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {}
      pushRoute(targetUrl);
      n.close();
    };
    // Keep strong reference so desktop browser V8 engine does not garbage collect prematurely
    _activeWebNotifications.push(n);
    if (_activeWebNotifications.length > 10) _activeWebNotifications.shift();
    return true;
  } catch (err) {
    console.warn('[WebNotif] Notification constructor failed:', err);
    return false;
  }
}

// Backward-compatibility alias
export const showWebSystemNotification = showSystemNotification;

// ── Token save with retry ────────────────────────────────────────────────────
/** Save push token to backend with up to 3 retries */
async function saveTokenToBackend(token: string, attempt = 1): Promise<void> {
  try {
    await updateProfile({ pushToken: token });
    console.log(`✅ [Push] Token saved to backend (attempt ${attempt})`);
  } catch (err: any) {
    if (attempt < 3) {
      const delay = attempt * 1500; // 1.5s, 3s
      console.warn(`⚠️ [Push] Token save failed, retrying in ${delay}ms... (${err.message})`);
      await new Promise(r => setTimeout(r, delay));
      return saveTokenToBackend(token, attempt + 1);
    }
    console.error(`❌ [Push] Token save failed after 3 attempts: ${err.message}`);
  }
}

export async function setupPushNotifications(): Promise<void> {
  // Web Browser / PWA mode: request Web Notification Center permission & bridge SW clicks
  if (!Capacitor.isNativePlatform()) {
    await requestWebNotificationPermission();
    return;
  }

  try {
    // Remove all previous listeners first to prevent duplicates on re-login
    await PushNotifications.removeAllListeners();

    // 1. Check permissions
    let permStatus = await PushNotifications.checkPermissions();
    console.log(`[Push] Permission status: ${permStatus.receive}`);

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
      console.log(`[Push] After request: ${permStatus.receive}`);
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] ❌ Permission not granted — user will not receive notifications.');
      return;
    }

    // 2. Create high-importance notification channel for Android (enables heads-up banner & sound)
    try {
      await PushNotifications.createChannel({
        id: 'emergency_alerts',
        name: 'Emergency Alerts & Status Updates',
        description: 'Real-time emergency alerts and report status updates from MDRRMO',
        importance: 5, // 5 = IMPORTANCE_HIGH (Heads-Up Banner)
        visibility: 1, // 1 = VISIBILITY_PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#EF4444',
      });
      console.log('[Push] ✅ Android notification channel emergency_alerts registered');
    } catch (chErr: any) {
      console.warn('[Push] Notification channel creation skipped/error:', chErr?.message);
    }

    // 3. Register with FCM
    console.log('[Push] Registering with FCM...');
    await PushNotifications.register();

    // 4. Handle FCM token — save to backend with retry
    PushNotifications.addListener('registration', async (token) => {
      console.log(`[Push] ✅ FCM token received: ${token.value.slice(0, 20)}...`);
      await saveTokenToBackend(token.value);
    });

    // 5. Registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] ❌ Registration error:', error.error);
    });

    // 6. App is OPEN (foreground) — dispatch custom event AND post to Android Notification Center!
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Foreground notification received:', notification.title);
      const dept = notification.data?.assignedDepartment || notification.data?.department;
      const payload: FcmNotificationPayload = {
        title: notification.title || 'SendResqPls',
        body: notification.body || '',
        incidentId: notification.data?.incidentId,
        status: notification.data?.status,
        type: notification.data?.type,
        department: dept,
      };

      if (notification.data?.incidentId) {
        addNotification({
          id: notification.data.incidentId,
          type: notification.title || 'Emergency Update',
          status: notification.data.status || 'DISPATCHED',
          department: dept,
        });
      }

      // Explicitly post to Android Notification Center even while app is in foreground!
      showSystemNotification({
        title: notification.title || 'SendResqPls Alert',
        body: notification.body || 'New emergency status update received.',
        incidentId: notification.data?.incidentId,
        url: notification.data?.incidentId ? `/mobile/history?incidentId=${notification.data.incidentId}` : '/mobile/notifications',
        category: 'status',
        force: true,
      }).catch(() => {});

      window.dispatchEvent(
        new CustomEvent(FCM_FOREGROUND_EVENT, { detail: payload })
      );
    });

    // 7. User TAPS notification from status bar (app was background/closed)
    // Uses pushRoute() instead of window.location.href to keep React Router alive.
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Notification tapped:', action.notification?.title);
      const data = action.notification?.data || {};
      const dept = data.assignedDepartment || data.department;

      if (data.incidentId) {
        addNotification({
          id: data.incidentId,
          type: action.notification?.title || 'Emergency Update',
          status: data.status || 'DISPATCHED',
          department: dept,
          read: true,
        });
      }

      if (data.type === 'NEW_INCIDENT' && data.incidentId) {
        pushRoute(`/requests/${data.incidentId}`);
      } else if (data.incidentId) {
        pushRoute(`/mobile/history?incidentId=${data.incidentId}`);
      }
    });

    console.log('[Push] ✅ All listeners registered.');

  } catch (error: any) {
    console.error('[Push] ❌ Setup error:', error.message);
  }
}
