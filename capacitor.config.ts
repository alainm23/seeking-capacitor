import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seekingterms',
  appName: 'Seeking Terms',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "115731276335-ls0jio5c9rc62vicm1pn3e1ogam6q1p6.apps.googleusercontent.com",
      forceCodeForRefreshToken : true
    }
  }
};

export default config;
