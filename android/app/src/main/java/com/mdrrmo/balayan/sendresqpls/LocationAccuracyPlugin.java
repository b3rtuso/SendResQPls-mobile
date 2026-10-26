package com.mdrrmo.balayan.sendresqpls;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.Priority;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "LocationAccuracy")
public class LocationAccuracyPlugin extends Plugin {

    public static final int REQUEST_CHECK_SETTINGS = 1001;
    private static LocationAccuracyPlugin instance;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    public static void onActivityResultStatic(int requestCode, int resultCode, Intent data) {
        if (instance != null) {
            instance.handleResolutionResult(requestCode, resultCode, data);
        }
    }

    public void handleResolutionResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CHECK_SETTINGS) {
            if (savedCall != null) {
                JSObject ret = new JSObject();
                if (resultCode == Activity.RESULT_OK) {
                    ret.put("enabled", true);
                } else {
                    ret.put("enabled", false);
                }
                savedCall.resolve(ret);
                savedCall = null;
            }
        }
    }

    @PluginMethod
    public void enableLocation(PluginCall call) {
        try {
            this.savedCall = call;

            LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000)
                    .setMinUpdateIntervalMillis(500)
                    .build();

            LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder()
                    .addLocationRequest(locationRequest)
                    .setAlwaysShow(true); // Triggers native Google Play Services dialog directly

            Task<LocationSettingsResponse> task = LocationServices.getSettingsClient(getActivity()).checkLocationSettings(builder.build());

            task.addOnCompleteListener(new OnCompleteListener<LocationSettingsResponse>() {
                @Override
                public void onComplete(@NonNull Task<LocationSettingsResponse> task) {
                    try {
                        LocationSettingsResponse response = task.getResult(Exception.class);
                        // All location settings are already satisfied
                        JSObject ret = new JSObject();
                        ret.put("enabled", true);
                        call.resolve(ret);
                        savedCall = null;
                    } catch (Exception exception) {
                        if (exception instanceof ResolvableApiException) {
                            try {
                                ResolvableApiException resolvable = (ResolvableApiException) exception;
                                resolvable.startResolutionForResult(getActivity(), REQUEST_CHECK_SETTINGS);
                            } catch (Exception e) {
                                JSObject ret = new JSObject();
                                ret.put("enabled", false);
                                ret.put("error", "Could not start resolution: " + e.getMessage());
                                call.resolve(ret);
                                savedCall = null;
                            }
                        } else {
                            JSObject ret = new JSObject();
                            ret.put("enabled", false);
                            ret.put("error", "Settings resolution unavailable: " + exception.getMessage());
                            call.resolve(ret);
                            savedCall = null;
                        }
                    }
                }
            });
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("enabled", false);
            ret.put("error", e.getMessage());
            call.resolve(ret);
            savedCall = null;
        }
    }

    @PluginMethod
    public void openLocationSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open location settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getActivity().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(fallback);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Could not open settings: " + ex.getMessage());
            }
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        handleResolutionResult(requestCode, resultCode, data);
    }
}
