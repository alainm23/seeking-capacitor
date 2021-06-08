package com.seekingterms;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate (savedInstanceState);

    // Facebook
    registerPlugin (com.getcapacitor.community.facebooklogin.FacebookLogin.class);

    // AdMob
    registerPlugin(com.getcapacitor.community.admob.AdMob.class);
  }
}
