import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mdrrmo.balayan.sendresqpls',
  appName: 'SendResqPls',
  webDir: 'dist',
  appendUserAgent: 'SendResQPls-App',
  // Pure Offline-First Bundling: loads bundled assets directly from device storage (dist)
  // Ensures instant ~100ms startup and full offline usability during disasters
  server: {
    androidScheme: 'http',
    errorPath: 'offline.html',
    cleartext: true,
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
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#0F1F38',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
};

export default config;
