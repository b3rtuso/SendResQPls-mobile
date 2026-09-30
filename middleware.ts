/**
 * Vercel Edge Middleware — Mobile Route Guard
 *
 * Runs on Vercel's edge servers BEFORE any HTML/JS is returned to the client.
 * Uses native Web APIs (Request / Response) — no Next.js imports needed for
 * a non-Next.js Vite project.
 *
 * How it works:
 *   capacitor.config.ts sets `appendUserAgent: "SendResQPls-App"` for both
 *   Android and iOS. The native WebView appends that token to every request
 *   at the OS level (not JavaScript), so regular browsers cannot spoof it casually.
 *
 *   If the token is present  → the request is from the APK → allowed through.
 *   If the token is absent   → regular browser visitor   → redirected to /admin/login.
 */
export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url);

  const pathname = url.pathname.toLowerCase();

  // Always allow password reset, recovery, login, signup, and portal routes in any browser
  if (
    pathname.includes('reset-password') ||
    pathname.includes('forgot-password') ||
    pathname.includes('login') ||
    pathname.includes('signup') ||
    pathname.includes('get-the-app')
  ) {
    return undefined;
  }

  // 1. Check native Android package header attached by Android WebView at the OS layer
  const requestedWith = (request.headers.get('x-requested-with') ?? '').toLowerCase();
  if (
    requestedWith.includes('com.mdrrmo.balayan.sendresqpls') ||
    requestedWith.includes('sendresqpls')
  ) {
    return undefined;
  }

  // 2. Check User-Agent (case-insensitive) for Capacitor custom tokens
  const ua = (request.headers.get('user-agent') ?? '').toLowerCase();
  if (
    ua.includes('sendresqpls-app') ||
    ua.includes('sendresqpls') ||
    ua.includes('capacitor')
  ) {
    return undefined;
  }

  // Redirect standard web visitors to the internal /get-the-app page
  return Response.redirect(new URL('/get-the-app', request.url), 302);
}

// Only guard /mobile and every path under it
export const config = {
  matcher: ['/mobile', '/mobile/:path*'],
};
