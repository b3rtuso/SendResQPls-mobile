/**
 * Helper utility to launch native Gmail application on mobile devices,
 * with fallbacks to webmail and domain-aware routing.
 */

export function openGmailApp(email?: string): void {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const cleanEmail = (email || '').trim().toLowerCase();
  const domain = cleanEmail.split('@')[1];

  // If user provided a specific non-Gmail domain, optionally route to that provider
  if (domain && (domain.includes('yahoo') || domain.includes('ymail'))) {
    window.open('https://mail.yahoo.com', '_blank');
    return;
  }
  if (domain && (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live.com'))) {
    window.open('https://outlook.live.com', '_blank');
    return;
  }

  // Primary: Launch Gmail app
  if (isAndroid) {
    try {
      // Android Intent targeting the native Gmail app package
      window.location.href =
        'intent://#Intent;package=com.google.android.gm;action=android.intent.action.MAIN;category=android.intent.category.APP_EMAIL;end';
    } catch {
      window.open('https://mail.google.com', '_blank');
    }

    // Safety fallback: If Android intent didn't blur/switch active window, open webmail
    setTimeout(() => {
      if (document.hasFocus()) {
        window.open('https://mail.google.com', '_blank');
      }
    }, 1200);
  } else if (isIOS) {
    // iOS Gmail app URL scheme
    window.location.href = 'googlegmail://';
    setTimeout(() => {
      if (document.hasFocus()) {
        window.open('https://mail.google.com', '_blank');
      }
    }, 1200);
  } else {
    // Desktop or mobile browser fallback
    window.open('https://mail.google.com', '_blank');
  }
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
