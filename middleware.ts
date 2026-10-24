/**
 * Vercel Edge Middleware — Pass-Through
 *
 * All routes (/mobile, /login, /signup, etc.) are open to all browsers,
 * Progressive Web Apps (PWA), and native Android APK clients without restrictions.
 */
export default function middleware(_request: Request): Response | undefined {
  return undefined;
}

export const config = {
  matcher: ['/mobile', '/mobile/:path*'],
};
