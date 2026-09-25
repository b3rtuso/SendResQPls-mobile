package com.mdrrmo.balayan.sendresqpls;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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
