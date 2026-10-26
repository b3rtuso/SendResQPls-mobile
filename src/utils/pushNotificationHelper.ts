import { PushNotifications } from '@capacitor/push-notifications';
import { updateProfile } from '../api/client';
import { Capacitor } from '@capacitor/core';
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
 * Also attaches a one-time user gesture fallback if the browser requires a tap.
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

  // Mobile browsers (Chrome on Android, Safari on iOS) often ignore requestPermission()
  // unless triggered inside a direct user tap gesture. Attach a one-time tap listener.
  if (Notification.permission === 'default' && !_gestureListenerAttached) {
    _gestureListenerAttached = true;
    const onFirstTap = async () => {
      window.removeEventListener('pointerdown', onFirstTap);
      window.removeEventListener('click', onFirstTap);
      _gestureListenerAttached = false;
      if (Notification.permission === 'default') {
        try {
          const res = await Notification.requestPermission();
          window.dispatchEvent(new CustomEvent('srq-web-notif-permission', { detail: res }));
        } catch {}
      }
    };
    window.addEventListener('pointerdown', onFirstTap, { once: true, passive: true });
    window.addEventListener('click', onFirstTap, { once: true, passive: true });
  }

  return Notification.permission;
}

export interface WebSystemNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  incidentId?: string;
  category?: NotificationCategory;
  force?: boolean;
}

/**
 * Displays a real OS / Phone Notification Center alert when running in the browser / PWA.
 * Uses ServiceWorkerRegistration.showNotification() as required by Android Chrome & Mobile Browsers,
 * with graceful fallback to `new Notification()` on desktop browsers without an active SW.
 */
export async function showWebSystemNotification(options: WebSystemNotificationOptions): Promise<boolean> {
  if (Capacitor.isNativePlatform()) return false;
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (!options.force && !shouldShowNotification(options.category || 'status')) {
    return false;
  }

  ensureServiceWorkerClickBridge();

  if (Notification.permission !== 'granted') {
    return false;
  }

  const targetUrl = options.url || (options.incidentId ? `/mobile/history?incidentId=${options.incidentId}` : '/mobile/notifications');
  const tag = options.tag || (options.incidentId ? `srq-incident-${options.incidentId}` : `srq-alert-${Date.now()}`);

  const notifPayload: NotificationOptions & Record<string, any> = {
    body: options.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: targetUrl,
      incidentId: options.incidentId,
      timestamp: Date.now(),
    },
  };

  // 1. Primary path for Android / iOS / Desktop PWA: ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js');
      }
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(options.title, notifPayload);
        return true;
      }
    } catch (swErr) {
      console.warn('[WebNotif] SW showNotification fallback:', swErr);
    }
  }

  // 2. Fallback for desktop browsers where Service Worker might not be controlling the page
  try {
    const n = new Notification(options.title, {
      body: options.body,
      icon: '/icon-192.png',
      tag,
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {}
      pushRoute(targetUrl);
      n.close();
    };
    return true;
  } catch (err) {
    console.warn('[WebNotif] Notification constructor failed:', err);
    return false;
  }
}

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

    // 5. App is OPEN (foreground) — dispatch custom event so UI shows a banner
    // Android does NOT auto-show a heads-up notification in foreground.
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

      window.dispatchEvent(
        new CustomEvent(FCM_FOREGROUND_EVENT, { detail: payload })
      );
    });

    // 6. User TAPS notification from status bar (app was background/closed)
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
        // Admin: go to the specific incident detail page
        pushRoute(`/requests/${data.incidentId}`);
      } else if (data.incidentId) {
        // Citizen: go to report history and automatically open Track Status modal
        pushRoute(`/mobile/history?incidentId=${data.incidentId}`);
      }
    });

    console.log('[Push] ✅ All listeners registered.');

  } catch (error: any) {
    console.error('[Push] ❌ Setup error:', error.message);
  }
}
