package com.seekingterms;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Facebook
    registerPlugin(com.getcapacitor.community.facebooklogin.FacebookLogin.class);

    // Google
    registerPlugin(GoogleAuth.class);

    // OneSignal
  }
}
