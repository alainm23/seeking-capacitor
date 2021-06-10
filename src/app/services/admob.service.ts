import { Injectable } from '@angular/core';

// Services
import {
  AdMob,
  RewardAdPluginEvents,
  AdLoadInfo,
  AdMobRewardItem,
  AdOptions,
  InterstitialAdPluginEvents
} from '@capacitor-community/admob';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';


@Injectable({
  providedIn: 'root'
})
export class AdmobService {
  constructor (private storage: Storage,
    private navController: NavController,
    private loadingCo1ntroller: LoadingController) {
  }

  async init () {
    await AdMob.initialize ({
      requestTrackingAuthorization: false,
      initializeForTesting: true,
    });

    setTimeout (async () => {
      await this.prepareRewardVideoAd ();

      AdMob.addListener (RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
        console.log ('RewardAdPluginEvents.Loaded', info);
      });
    
      AdMob.addListener (RewardAdPluginEvents.Rewarded, async (rewardItem: AdMobRewardItem) => {
        await this.storage.remove ('viewed-profiles');
      });
    }, 2500);
  }

  rewardVideo () {
    return AdMob.showRewardVideoAd ();
  }

  prepareRewardVideoAd () {
    const options: AdOptions = {
      adId: 'ca-app-pub-3940256099942544/5224354917'
    };

    return AdMob.prepareRewardVideoAd (options);
  }

  async valid_reward_video (id: string) {
    let list: any [] = JSON.parse (await this.storage.get ('viewed-profiles'));

    if (list === null) {
      this.navController.navigateForward (['profile', id]);
      list = [id];
      await this.storage.set ('viewed-profiles', JSON.stringify (list));
    } else {
      if (list.length < 4) {
        if (list.find (x => x === id) === undefined) {
          list.push (id);
          await this.storage.set ('viewed-profiles', JSON.stringify (list));
        }

        this.navController.navigateForward (['profile', id]);
      } else {
        this.rewardVideo ().then ((res: any) => {
          console.log ('rewardVideo', res);
          this.navController.navigateForward (['profile', id]);
        }).catch ((error: any) => {
          console.log (error);
          this.navController.navigateForward (['profile', id]);
          this.prepareRewardVideoAd ();
        });
      }
    }

    console.log (list);
  }

  async interstitial () {
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      console.log (info);
    });
  
    const options: AdOptions = {
      adId: 'ca-app-pub-3940256099942544/1033173712',
    };

    await AdMob.prepareInterstitial (options);
    await AdMob.showInterstitial ();
  }
}
