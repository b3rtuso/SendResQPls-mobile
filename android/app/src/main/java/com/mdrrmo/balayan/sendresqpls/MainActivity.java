package com.mdrrmo.balayan.sendresqpls;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;
    private ActivityResultLauncher<Intent> cameraCaptureLauncher;
    private ActivityResultLauncher<String> cameraPermissionLauncher;
    private ValueCallback<Uri[]> pendingFilePathCallback;
    private Uri pendingCameraImageUri;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocationAccuracyPlugin.class);
        registerPlugin(MailLauncherPlugin.class);

        // Register camera-only launchers before super.onCreate / onStart
        cameraCaptureLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (pendingFilePathCallback != null) {
                    Uri[] uris = null;
                    if (result.getResultCode() == Activity.RESULT_OK && pendingCameraImageUri != null) {
                        uris = new Uri[] { pendingCameraImageUri };
                    }
                    pendingFilePathCallback.onReceiveValue(uris);
                    pendingFilePathCallback = null;
                    pendingCameraImageUri = null;
                }
            }
        );

        cameraPermissionLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    launchCameraOnlyCapture();
                } else if (pendingFilePathCallback != null) {
                    pendingFilePathCallback.onReceiveValue(null);
                    pendingFilePathCallback = null;
                    pendingCameraImageUri = null;
                }
            }
        );

        super.onCreate(savedInstanceState);

        // Permanently disable Android 12+ stretch overscroll bounce on the WebView
        // and enforce strict Camera-Only file chooser (no gallery/file upload on phones or tablets)
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

                // Override onShowFileChooser to strictly open native camera only — never gallery/file manager
                webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                    @Override
                    public boolean onShowFileChooser(
                        WebView view,
                        final ValueCallback<Uri[]> filePathCallback,
                        final FileChooserParams fileChooserParams
                    ) {
                        return handleCameraOnlyFileChooser(filePathCallback);
                    }
                });
            }
        } catch (Exception ignored) {
        }

        // Setup real-time network connectivity sync to keep WebView navigator.onLine accurate
        setupNetworkMonitoring();
    }

    private boolean handleCameraOnlyFileChooser(final ValueCallback<Uri[]> filePathCallback) {
        if (pendingFilePathCallback != null) {
            try {
                pendingFilePathCallback.onReceiveValue(null);
            } catch (Exception ignored) {
            }
            pendingFilePathCallback = null;
        }
        pendingFilePathCallback = filePathCallback;

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            launchCameraOnlyCapture();
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
        return true;
    }

    private void launchCameraOnlyCapture() {
        try {
            File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
            if (storageDir == null) {
                storageDir = getCacheDir();
            }
            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
            File photoFile = File.createTempFile("SRQ_CAM_" + timeStamp + "_", ".jpg", storageDir);
            pendingCameraImageUri = FileProvider.getUriForFile(
                this,
                getPackageName() + ".fileprovider",
                photoFile
            );

            Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, pendingCameraImageUri);
            takePictureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            cameraCaptureLauncher.launch(takePictureIntent);
        } catch (IOException | RuntimeException ex) {
            if (pendingFilePathCallback != null) {
                pendingFilePathCallback.onReceiveValue(null);
                pendingFilePathCallback = null;
                pendingCameraImageUri = null;
            }
        }
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

