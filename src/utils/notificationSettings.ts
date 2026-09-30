/**
 * Notification Settings Utility
 * 
 * Manages user notification preferences (status updates, emergency alerts,
 * system notices, sound) and synthesizes native offline alert chimes
 * using the Web Audio API.
 */

export interface NotificationSettings {
  statusUpdates: boolean;
  emergencyAlerts: boolean;
  systemNotices: boolean;
  sound: boolean;
}

export type NotificationCategory = 'status' | 'emergency' | 'system' | 'general';

const NOTIF_SETTINGS_KEY = 'notifSettings';

export const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  statusUpdates: true,
  emergencyAlerts: true,
  systemNotices: true,
  sound: true,
};

export function getNotifSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_NOTIF_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      statusUpdates: typeof parsed.statusUpdates === 'boolean' ? parsed.statusUpdates : DEFAULT_NOTIF_SETTINGS.statusUpdates,
      emergencyAlerts: typeof parsed.emergencyAlerts === 'boolean' ? parsed.emergencyAlerts : DEFAULT_NOTIF_SETTINGS.emergencyAlerts,
      systemNotices: typeof parsed.systemNotices === 'boolean' ? parsed.systemNotices : DEFAULT_NOTIF_SETTINGS.systemNotices,
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : DEFAULT_NOTIF_SETTINGS.sound,
    };
  } catch {
    return { ...DEFAULT_NOTIF_SETTINGS };
  }
}

export function saveNotifSettings(partial: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotifSettings();
  const updated: NotificationSettings = { ...current, ...partial };
  try {
    localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('srq-notif-settings-changed', { detail: updated }));
  } catch {}
  return updated;
}

export function shouldShowNotification(category: NotificationCategory): boolean {
  const settings = getNotifSettings();
  if (category === 'status') return settings.statusUpdates;
  if (category === 'emergency') return settings.emergencyAlerts;
  if (category === 'system') return settings.systemNotices;
  return true; // general UI feedback toasts always permitted
}

// Global cached AudioContext
let audioCtx: AudioContext | null = null;

/**
 * Plays a pleasant, two-tone notification chime (D5 -> A5)
 * using the native browser Web Audio API. Requires zero external audio files.
 */
export function playNotificationSound(force = false): void {
  if (!force) {
    const settings = getNotifSettings();
    if (!settings.sound) return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.10);
    gain2.gain.setValueAtTime(0.22, now + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.10);
    osc2.stop(now + 0.40);
  } catch (err) {
    console.debug('Could not play notification sound:', err);
  }
}
