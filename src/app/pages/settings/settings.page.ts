import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Storage } from '@ionic/storage-angular';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  lang: string;
  seccion: string = 'account';
  modo_incognito: boolean = false;
  send_me_gifts: boolean = false;
  auto_renew: boolean = false;
  get_newsletter:boolean = false;
  metric_system: boolean = false;
  permiso_ubicacion: boolean = false;
  planes: any [] = [];
  winks_notifications: any = {
    alert: false,
    email: false
  }

  favorites_notifications: any = {
    alert: false,
    email: false,
    inbox: false
  }

  message_notifications: any = {
    alert: false,
    email: false
  }

  profile_notifications: any = {
    alert: false,
    email: false,
    inbox: false
  };

  members_and_matches_notifications: any = {
    alert: false,
    email: false
  };

  profile_changes_notifications: any = {
    alert: false,
    email: false
  };

  verification_and_information_notifications: any = {
    alert: false,
    email: false
  };

  // special_events_notifications: any = {
  //   alert: false,
  //   email: false
  // };

  // news_and_updates_notifications: any = {
  //   alert: false,
  //   email: false
  // };

  news_and_events_notifications: any = {
    alert: false,
    email: false
  }

  promotions_notifications: any = {
    alert: false,
    email: false
  };

  constructor (public auth: AuthService,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController,
    private database: DatabaseService,
    private alertController: AlertController,
    private storage: Storage,
    private translate: TranslateService) { }

  async ngOnInit () {
    this.storage.get ('lang').then (async (lang: string) => {
      this.lang = lang;
      if (lang === undefined || lang === null) {
        this.lang = 'en';
      }
    });

    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.get_settings ().subscribe ((res: any) => {
      console.log (res);

      this.modo_incognito = res.modo_incognito;
      this.send_me_gifts = res.send_me_gifts;
      this.auto_renew = res.auto_renew;
      this.get_newsletter = res.get_newsletter;
      this.metric_system = res.metric_system;
      this.permiso_ubicacion = res.permiso_ubicacion;

      this.winks_notifications = res.winks_notifications;
      this.favorites_notifications = res.favorites_notifications;
      this.message_notifications = res.message_notifications;
      this.members_and_matches_notifications = res.members_and_matches_notifications;
      this.profile_changes_notifications = res.profile_changes_notifications;
      this.verification_and_information_notifications = res.verification_and_information_notifications;
      // this.special_events_notifications = res.special_events_notifications;
      // this.news_and_updates_notifications = res.news_and_updates_notifications;
      this.news_and_events_notifications = res.news_and_events_notifications;
      this.promotions_notifications = res.promotions_notifications;

      this.database.get_datos ('planes').subscribe ((res: any) => {
        console.log (res);
        loading.dismiss ();
        this.planes = res;
      }, error => {
        loading.dismiss ();
        console.log (error);
      });
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  update (event: any, campo: string) {
    let request: any = {};
    request.campo = campo;
    request.valor = event.detail.checked; 

    console.log (request);

    this.auth.save_settings (request).subscribe ((res: any) => {
      // this.presentToast ('Success', 'success');
    }, error => {
      console.log (error);
    });
  }

  update_check (event: any, object: any, name: string, campo: string) {
    object [campo] = event.detail.checked;

    let request: any = {};
    request.campo = name;
    request.valor = object;

    console.log (request);

    this.auth.save_settings (request).subscribe ((res: any) => {
      console.log (res);
      // this.presentToast ('Success', 'success');
    }, error => {
      console.log (error);
    });
  }

  back () {
    this.navController.back ();
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 1000,
      position: 'top'
    });

    toast.present ();
  }

  get_plan_name (membresia: any) {
    if (membresia === null || membresia === undefined) {
      return '';
    }

    return this.planes.find (x => x.id === membresia).nombre;
  }

  async cancel_plan_confirm () {
    const alert = await this.alertController.create ({
      header: 'Confirm Operation',
      message: '??Are you sure you want to cancel you current plans?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Confirm',
          handler: () => {
            this.cancel_plan_submit ();
          }
        }
      ]
    });

    await alert.present ();
  }

  async cancel_plan_submit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.cancelar_mebresia ().subscribe ((res: any) => {
      console.log (res);
      if (res.status === true) {
        this.auth.USER_DATA.membresia = null;
        this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
          loading.dismiss ();
        });
      } else {
        loading.dismiss ();
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  async delete_account_confirm () {
    const alert = await this.alertController.create ({
      header: 'Confirm Operation',
      message: '??Are you sure you want to delete you account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Confirm',
          handler: () => {
            this.delete_account_submit ();
          }
        }
      ]
    });

    await alert.present ();
  }

  async delete_account_submit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.delete_account ().subscribe ((res: any) => {
      console.log (res);
      if (res.status === true) {
        this.auth.logout ().subscribe (async (res: any) => {
          this.borrar_user_access ();
          this.auth.logout_social ();
          await loading.dismiss ();
        }, async error => {
          this.borrar_user_access ();
          this.auth.logout_social ();
          await loading.dismiss ();
        });
      } else {
        loading.dismiss ();
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  borrar_user_access () {
    this.storage.clear ().then (() => {
      this.navController.navigateRoot ('login');
    });
  }

  buttonClick () {
    this.navController.navigateForward (['settings-notifications']);
  }

  change_lan (event: any) {
    moment.locale ();
    this.set_lang (event.detail.value);
  }

  async set_lang (lang: any) {
    this.translate.setDefaultLang (lang);
    await this.storage.set ('lang', lang);

    let request: any = {};
    request.campo = 'language';
    request.valor = this.lang === 'en' ? 1: 2;

    console.log (request);

    this.auth.save_settings (request).subscribe ((res: any) => {
      console.log (res);
      // this.presentToast ('Success', 'success');
    }, error => {
      console.log (error);
    });
  }
}
