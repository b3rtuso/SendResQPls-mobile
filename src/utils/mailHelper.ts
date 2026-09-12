/**
 * Helper utility to launch native Gmail application on mobile devices,
 * with fallbacks to webmail and domain-aware routing.
 * Also provides native bridge to read system clipboard safely.
 */
import { registerPlugin, Capacitor } from '@capacitor/core';

interface MailLauncherPlugin {
  openGmail(): Promise<void>;
  getClipboard(): Promise<{ value: string }>;
}

const MailLauncher = registerPlugin<MailLauncherPlugin>('MailLauncher');

export async function openGmailApp(email?: string): Promise<void> {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 1. If running natively in the Android APK, use the custom Android Plugin
  // which launches the native Gmail application directly via PackageManager
  if (Capacitor.isNativePlatform()) {
    try {
      await MailLauncher.openGmail();
      return;
    } catch (err) {
      console.warn('[openGmailApp] Native MailLauncher error, attempting intent fallback:', err);
    }
  }

  // 2. If user is on Android browser, trigger Android Intent to open the Gmail app directly
  if (isAndroid) {
    try {
      window.location.href =
        'intent://#Intent;package=com.google.android.gm;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end';
      return;
    } catch {
      // ignore
    }
  }

  // 3. If iOS mobile, open native Gmail app scheme
  if (isIOS) {
    window.location.href = 'googlegmail://';
    return;
  }

  // 4. Desktop / Laptop fallback only (where native mobile apps don't exist)
  const cleanEmail = (email || '').trim().toLowerCase();
  const domain = cleanEmail.split('@')[1];
  if (domain && (domain.includes('yahoo') || domain.includes('ymail'))) {
    window.open('https://mail.yahoo.com', '_blank');
    return;
  }
  if (domain && (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live.com'))) {
    window.open('https://outlook.live.com', '_blank');
    return;
  }

  window.open('https://mail.google.com', '_blank');
}

/**
 * Reads system clipboard text via native Android ClipboardManager when available,
 * with fallback to web navigator.clipboard.
 */
export async function getNativeClipboard(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await MailLauncher.getClipboard();
      if (res && typeof res.value === 'string') {
        return res.value;
      }
    } catch (err) {
      console.warn('[getNativeClipboard] Native read failed:', err);
    }
  }

  // Browser fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch {
    // Ignore web permission restrictions
  }

  return '';
}

/**
 * Extracts a 6-digit numeric verification code from any raw text.
 * Handles formats like:
 * - "123456"
 * - " 123456 "
 * - "123-456"
 * - "Your code is: 123456"
 * - "Code 123 456"
 */
export function extractVerificationCode(raw: string): string {
  if (!raw) return '';
  // 1. Look for explicit 6 continuous digits
  const sixContinuous = raw.match(/\b\d{6}\b/);
  if (sixContinuous) return sixContinuous[0];

  // 2. Look for 3 digits dash/space 3 digits e.g. 123-456 or 123 456
  const splitMatch = raw.match(/\b(\d{3})[\s-](\d{3})\b/);
  if (splitMatch) return `${splitMatch[1]}${splitMatch[2]}`;

  // 3. Strip all non-digits and take first 6 digits
  const cleanDigits = raw.replace(/\D/g, '');
  return cleanDigits.slice(0, 6);
}
