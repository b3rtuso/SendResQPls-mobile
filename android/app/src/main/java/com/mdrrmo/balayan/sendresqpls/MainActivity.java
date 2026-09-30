package com.mdrrmo.balayan.sendresqpls;

import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocationAccuracyPlugin.class);
        registerPlugin(MailLauncherPlugin.class);
        super.onCreate(savedInstanceState);

        // Permanently disable Android 12+ stretch overscroll bounce on the WebView
        // This prevents the WebView from being pulled away from the window canvas,
        // eliminating any black gap or navigation bar background clipping glitch.
        try {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
                webView.setBackgroundColor(android.graphics.Color.WHITE);

                // Explicitly enforce SendResQPls-App token in WebView User-Agent
                android.webkit.WebSettings settings = webView.getSettings();
                String currentUa = settings.getUserAgentString();
                if (currentUa != null && !currentUa.contains("SendResQPls-App")) {
                    settings.setUserAgentString(currentUa + " SendResQPls-App");
                }
            }
        } catch (Exception ignored) {
        }

        // Setup real-time network connectivity sync to keep WebView navigator.onLine accurate
        setupNetworkMonitoring();
    }

    private boolean isNetworkAvailable() {
        if (connectivityManager == null) {
            connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        }
        if (connectivityManager != null) {
            Network activeNetwork = connectivityManager.getActiveNetwork();
            if (activeNetwork != null) {
                NetworkCapabilities caps = connectivityManager.getNetworkCapabilities(activeNetwork);
                return caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
            }
        }
        return false;
    }

    private void updateWebViewNetworkState(boolean isAvailable) {
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.setNetworkAvailable(isAvailable);
                }
            } catch (Exception ignored) {
            }
        });
    }

    private void setupNetworkMonitoring() {
        try {
            if (connectivityManager == null) {
                connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            }
            if (connectivityManager != null) {
                // Immediately synchronize initial network status
                updateWebViewNetworkState(isNetworkAvailable());

                NetworkRequest request = new NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build();

                networkCallback = new ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(@NonNull Network network) {
                        updateWebViewNetworkState(true);
                    }

                    @Override
                    public void onLost(@NonNull Network network) {
                        updateWebViewNetworkState(isNetworkAvailable());
                    }

                    @Override
                    public void onCapabilitiesChanged(@NonNull Network network, @NonNull NetworkCapabilities caps) {
                        boolean hasInternet = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
                        updateWebViewNetworkState(hasInternet);
                    }
                };

                connectivityManager.registerNetworkCallback(request, networkCallback);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        updateWebViewNetworkState(isNetworkAvailable());
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (connectivityManager != null && networkCallback != null) {
                connectivityManager.unregisterNetworkCallback(networkCallback);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        LocationAccuracyPlugin.onActivityResultStatic(requestCode, resultCode, data);
    }
}
