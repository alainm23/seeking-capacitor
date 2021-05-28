import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

// Services
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { WebsocketService } from './services/websocket.service';
import { OnesignalService } from './services/onesignal.service';
import { AuthService } from './services/auth.service';
import { Capacitor } from "@capacitor/core";

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
    private auth: AuthService) {
    this.OnInit ();
  }

  async OnInit () {
    await this.storage.create ();
    if (Capacitor.isNativePlatform ()) {
      this.platform.ready ().then (() => {
        this.auth.google_init ();
        this.init ();
      });
    } else {
      this.init ();
    }
  }

  async init () {
    let user_data: any = JSON.parse (await this.storage.get ('USER_DATA'));
    let user_access: any = JSON.parse (await this.storage.get ('USER_ACCESS'));

    if (user_data !== undefined && user_data !== null) {
      console.log ('Iniciamos WebSocket & OneSignal');
      this.websocket.init_websocket (user_data.id, user_access.access_token);
      this.auth.update_user_data (user_access.access_token);
      if (Capacitor.isNativePlatform ()) {
        this.onesignal.init_onesignal ({USER_ACCESS: user_access, USER_DATA: user_data});
      }
    }

    this.auth.get_user_observable ().subscribe ((res: any) => {
      console.log ('Iniciamos WebSocket & OneSignal', res);
      this.websocket.init_websocket (res.USER_DATA.id, res.USER_ACCESS.access_token);

      if (Capacitor.isNativePlatform ()) {
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
}
