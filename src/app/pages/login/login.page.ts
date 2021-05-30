import { Component, OnInit } from '@angular/core';

// Services
import { LoadingController, NavController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  lang: string;
  location: any;
  constructor (private auth: AuthService, 
    private navController: NavController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private storage: Storage,
    private platform: Platform) { }

  ngOnInit () {
    this.storage.get ('lang').then (async (lang: string) => {
      this.lang = lang;
      if (lang === undefined || lang === null) {
        this.lang = 'en';
      }

      moment.locale (this.lang);
      this.translate.setDefaultLang (this.lang);
      await this.storage.set ('lang', this.lang);
    });

    this.form = new FormGroup ({
      email: new FormControl ('', [Validators.required]),
      password: new FormControl ('', [Validators.required])
    });
  }
  
  async submit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.login (this.get_trim (this.form.value.email), this.get_trim (this.form.value.password)).subscribe ((res: any) => {
      console.log (res);
      if (res.user.estado_cuenta > 0) {
        this.navController.navigateRoot (['block-page', JSON.stringify (res.user)]).then (() => {
          loading.dismiss ();
        });
      } else {
        this.auth.save_local_user (res).then (() => {
          loading.dismiss ();
          this.navController.navigateRoot ('home');
          // this.auth.request_notification (res);
        });
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
      this.presentToast (this.translate.instant ('The access data is incorrect'), 'danger');
    });
  }

  get_trim (value: string) {
    return value.trim ();
  }

  registro () {
    this.navController.navigateForward (['request-gps', 'null']);
  }

  restore () {
    this.navController.navigateForward ('restore-password');
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 2000,
      position: 'top'
    });

    toast.present ();
  }

  change_lan (event: any) {
    moment.locale (event.detail.value);
    this.translate.setDefaultLang (event.detail.value);
    this.storage.set ('lang', event.detail.value);
  }

  google () {
    if (Capacitor.isNativePlatform ()) {
      this.auth.google ();
    } else {
      let request: any = {
          "accessToken":"ssya29.a0AfH6SMBvrBLLrvmH29sCMjRBCMSVy7jhi_QQEesqr6BqRplwu0lLey5lCCRDDbSrLoFoCCTTGhopQ3DBr_E-hO5LbbkBZxLDhnbCxYbEJxryqeR-7pp34xvo99laK3i6sE7alZfg-k6srTjSMsm6VX_MqnpE",
          "expires":1620843027,
          "expires_in":1166,
          "email":"cccccd@gmail.com",
          "userId":"cccccdssss",
          "displayName":"Alain",
          "givenName":"Alain",
          "imageUrl":"https://lh3.googleusercontent.com/a-/AOh14GiBhVvYRxAalxzaYLaRSoKgw-fGUGXy44KhO7_lCw"
      };
      
      this.auth.login_social (request.userId, 'Google', request.displayName, request.email).subscribe ((res: any) => {
        console.log (res);
        if (res.user.estado_cuenta > 0) {
          this.navController.navigateRoot (['block-page', JSON.stringify (res.user)]).then (() => {
          });
        } else {
          if (res.user.registro_incompleto == 1) {
            this.navController.navigateForward (['request-gps', res.user.id]);
          } else {
            this.auth.save_local_user (res).then (() => {
              this.navController.navigateRoot ('home');
            });
          }
        }
      }, error => {
        console.log (error);
      });
    }
  }

  facebook () {
    if (Capacitor.isNativePlatform ()) {
      this.auth.facebook ();
    } else {
      let request: any = {
        "id":"474482337467820",
        "name":"Alain Meza",
      };

      this.auth.login_social (request.id, 'Facebook', request.name, '').subscribe ((res: any) => {
        console.log (res);
        if (res.user.estado_cuenta > 0) {
          this.navController.navigateRoot (['block-page', JSON.stringify (res.user)]);
        } else {
          if (res.user.registro_incompleto == 1) {
            this.navController.navigateForward (['request-gps', res.user.id]);
          } else {
            this.auth.save_local_user (res).then (() => {
              this.navController.navigateRoot ('home');
            });
          }
        }
      }, error => {
        console.log (error);
      });
    }
  }

  show_api_error (res: any, values: string []) {
    values.forEach ((value: string) => {
      if (res.errors [value]) {
        res.errors [value].forEach ((error: string) => {
          this.presentToast (error, 'danger');
        });
      }
    });
  }
}
