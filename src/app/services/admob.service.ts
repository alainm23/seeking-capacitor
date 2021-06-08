import { Injectable } from '@angular/core';

// Services
import { AdMob, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem, AdOptions } from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root'
})
export class AdmobService {

  constructor () {
  }

  async init () {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      initializeForTesting: true,
    });
  }

  async rewardVideo () {
    AdMob.addListener (RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
      console.log ('RewardAdPluginEvents.Loaded', info);
    });
  
    AdMob.addListener (RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
      // Subscribe user rewarded
      console.log ('RewardAdPluginEvents.Rewarded', rewardItem);
    });
  
    const options: AdOptions = {
      adId: 'ca-app-pub-1111244183107971~6051949363',
      // isTesting: true
      // npa: true
    };
    await AdMob.prepareRewardVideoAd (options);
    const rewardItem = await AdMob.showRewardVideoAd ();
  }
}
