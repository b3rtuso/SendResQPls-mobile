package com.mdrrmo.balayan.sendresqpls;

import android.content.Intent;
import android.content.pm.PackageManager;
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
}
