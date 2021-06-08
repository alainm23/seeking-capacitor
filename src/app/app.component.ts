import { Component } from '@angular/core';
import { AlertController, Platform, NavController} from '@ionic/angular';

// Services
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { WebsocketService } from './services/websocket.service';
import { OnesignalService } from './services/onesignal.service';
import { AuthService } from './services/auth.service';
import { Capacitor } from "@capacitor/core";
import { App } from '@capacitor/app';
import { Location } from '@angular/common';
import { AdmobService } from './services/admob.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor (private storage: Storage,
    private platform: Platform,
    private translate: TranslateService,
    private websocket: WebsocketService,
    private onesignal: OnesignalService,
    private auth: AuthService,
    private location: Location,
    private alertController: AlertController,
    private navController: NavController,
    private admob: AdmobService) {
    this.OnInit ();
  }

  async OnInit () {
    await this.storage.create ();

    if (Capacitor.isNativePlatform ()) {
      this.platform.ready ().then (() => {
        this.init ();
      });
    } else {
      this.init ();
    }
  }

  async init () {
    App.addListener ('backButton', () => {
      console.log('Back press handler!');

      if (this.location.isCurrentPathEqualTo ('/tabs/home') || 
      this.location.isCurrentPathEqualTo ('/tabs/inbox') || 
      this.location.isCurrentPathEqualTo ('/tabs/favorites') ||
      this.location.isCurrentPathEqualTo ('/tabs/profile-menu') ||
      this.location.isCurrentPathEqualTo ('/login')) {
        console.log('Show Exit Alert!');
        // this.showExitConfirm ();
        App.exitApp ();
      } else {
        console.log('Navigate to back page');
        this.navController.back ();
      }
    });
    
    let user_data: any = JSON.parse (await this.storage.get ('USER_DATA'));
    let user_access: any = JSON.parse (await this.storage.get ('USER_ACCESS'));

    if (user_data !== undefined && user_data !== null) {
      console.log ('Iniciamos WebSocket & OneSignal');
      this.websocket.init_websocket (user_data.id, user_access.access_token);
      this.auth.update_user_data (user_access.access_token);
      if (Capacitor.isNativePlatform ()) {
        this.admob.init ();
        this.onesignal.init_onesignal ({USER_ACCESS: user_access, USER_DATA: user_data});
      }
    }

    this.auth.get_user_observable ().subscribe ((res: any) => {
      console.log ('Iniciamos WebSocket & OneSignal', res);
      this.websocket.init_websocket (res.USER_DATA.id, res.USER_ACCESS.access_token);

      if (Capacitor.isNativePlatform ()) {
        this.admob.init ();
        this.onesignal.init_onesignal (res);
      }
    });

    moment.locale ('en');
    this.translate.setDefaultLang ('en');

    let lang = await this.storage.get ('lang');
    if (lang !== undefined && lang !== null) {
      moment.locale (lang);
      this.translate.setDefaultLang (lang);
      await this.storage.set ('lang', lang);
    }
  }

  showExitConfirm() {
    this.alertController.create ({
      header: 'App termination',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        handler: () => {
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Exit',
        handler: () => {
          
        }
      }]
    }).then (alert => {
      alert.present();
    });
  }
}
