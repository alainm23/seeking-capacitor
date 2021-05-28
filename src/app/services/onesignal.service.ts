import { Injectable } from '@angular/core';

// services
import { OneSignal, OSNotification, OSNotificationOpenedResult } from '@ionic-native/onesignal/ngx';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from'../services/database.service';
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  constructor (private auth: AuthService,
    private platform: Platform,
    private database: DatabaseService,
    private onesignal: OneSignal) {
  }

  async init_onesignal (res: any): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      if (res.USER_ACCESS ===  null || res.USER_ACCESS === undefined) {
        resolve (false);
      } else {
        this.onesignal.startInit ('44ce9816-3902-4d54-8ba0-dfb14bfb85e9', '905206280664');
        this.onesignal.inFocusDisplaying (this.onesignal.OSInFocusDisplayOption.Notification);
    
        this.onesignal.handleNotificationReceived ().subscribe ((response: OSNotification) => {
          // do something when notification is received
          // console.log (response.dis)
        });
    
        this.onesignal.handleNotificationOpened ().subscribe ((response: OSNotificationOpenedResult) => {
          // do something when a notification is opened
        });
        
        this.onesignal.getIds ().then ((identity: any) => {
          this.database.save_onesignal_player_id (identity.userId).subscribe ((res: any) => {
            resolve (true);
          }, error => {
            console.log (error);
            resolve (false);
          });
        });
    
        this.onesignal.endInit ();
      }
    });
  }
}
