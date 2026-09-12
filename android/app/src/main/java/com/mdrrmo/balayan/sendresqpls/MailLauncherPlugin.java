package com.mdrrmo.balayan.sendresqpls;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MailLauncher")
public class MailLauncherPlugin extends Plugin {

    @PluginMethod
    public void openGmail(PluginCall call) {
        try {
            PackageManager pm = getActivity().getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage("com.google.android.gm");
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(launchIntent);
                call.resolve();
                return;
            }

            // Fallback: Open general email client application if Gmail is not default
            Intent emailIntent = new Intent(Intent.ACTION_MAIN);
            emailIntent.addCategory(Intent.CATEGORY_APP_EMAIL);
            emailIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (emailIntent.resolveActivity(pm) != null) {
                getActivity().startActivity(emailIntent);
                call.resolve();
                return;
            }

            call.reject("No email application found on this device");
        } catch (Exception e) {
            call.reject("Failed to open email app: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getClipboard(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                ClipboardManager clipboard = (ClipboardManager) getActivity().getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null && clipboard.hasPrimaryClip()) {
                    ClipData clipData = clipboard.getPrimaryClip();
                    if (clipData != null && clipData.getItemCount() > 0) {
                        CharSequence text = clipData.getItemAt(0).getText();
                        if (text != null) {
                            JSObject ret = new JSObject();
                            ret.put("value", text.toString());
                            call.resolve(ret);
                            return;
                        }
                    }
                }
                JSObject ret = new JSObject();
                ret.put("value", "");
                call.resolve(ret);
            } catch (Exception e) {
                JSObject ret = new JSObject();
                ret.put("value", "");
                call.resolve(ret);
            }
        });
    }
}
