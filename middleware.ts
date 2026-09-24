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

  // Always allow password reset, recovery, login, and signup routes in any browser
  if (
    pathname.includes('reset-password') ||
    pathname.includes('forgot-password') ||
    pathname.includes('login') ||
    pathname.includes('signup')
  ) {
    return undefined;
  }

  const ua = request.headers.get('user-agent') ?? '';

  if (!ua.includes('SendResQPls-App')) {
    // Safely redirect web visitors to the internal /get-the-app page
    return Response.redirect(new URL('/get-the-app', request.url), 302);
  }

  // Allow: it is the Capacitor APK — return undefined to continue normally
  return undefined;
}

// Only guard /mobile and every path under it
export const config = {
  matcher: ['/mobile', '/mobile/:path*'],
};
