import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mdrrmo.balayan.sendresqpls',
  appName: 'SendResqPls',
  webDir: 'dist',
  // Live-update mode: loads your deployed Vercel URL
  // This means the APK always gets the latest version automatically
  server: {
    url: 'https://sendresqpls-mobile.vercel.app/mobile',
    cleartext: false,
    allowNavigation: [
      'sendresqpls-mobile.vercel.app',
    ],
  },
  android: {
    backgroundColor: '#FFFFFF',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Appended to every HTTP request the WebView makes (native level, not JS)
    // Used by Vercel Edge Middleware to distinguish APK traffic from browser traffic
    appendUserAgent: 'SendResQPls-App',
  },
  ios: {
    // Same token for iOS — appended to the WKWebView User-Agent natively
    appendUserAgent: 'SendResQPls-App',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F172A',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
