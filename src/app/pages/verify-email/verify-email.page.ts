import { Component, OnInit } from '@angular/core';

// Services
import { WebsocketService } from '../../services/websocket.service';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';
import { UtilsService } from 'src/app/services/utils.service';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {
  email_sent: string;
  constructor (private websocket: WebsocketService,
    private database: DatabaseService,
    public auth: AuthService,
    private loadingController: LoadingController,
    private navController: NavController,
    private route: ActivatedRoute,
    private storage: Storage,
    private toastController: ToastController,
    private utils: UtilsService,
    private alertController: AlertController) { }

  async ngOnInit () {
    this.storage.get ('USER_ACCESS').then (async (user: any) => {
      console.log (user);

      if (user !== null) {
        this.auth.USER_ACCESS = JSON.parse (user);
        this.auth.USER_DATA = JSON.parse (await this.storage.get ('USER_DATA'));
        
        this.email_sent = await this.storage.get ('verify-email-sent');

        this.websocket.create_channel ().listen ('.EmailVerified', async (res: any) => {
          console.log (res);
          this.auth.USER_DATA.email_verified_at = true;
          this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
            this.navController.navigateRoot ('request-notification');
          });
        });
      }
    });
  }

  async validar_correo () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.get_user ().subscribe (async (res: any) => {
      console.log (res);
      loading.dismiss ();

      if (res.email_verified_at !== null) {
        this.auth.USER_DATA.email_verified_at = true;
        await this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA));
        this.navController.navigateRoot ('request-notification');
      } else {

      }
    }, error => {
      console.log (error);
      loading.dismiss ();
    });
  }

  async resend () {
    let now = moment ();
    let verify_email = moment (await this.storage.get ('verify-email-sent'));

    console.log ('now: ', now.format ());
    console.log ('send: ', verify_email.format ());
    console.log (now.diff (verify_email, 'minutes'));

    if (now.diff (verify_email, 'minutes') <= 10) {
      this.presentToast (
        this.utils.get_translate (
          'We have already sent you a validation email to') + ' ' + this.auth.USER_DATA.email + '\n' + this.utils.get_translate ('Please check your spam inbox'),
        'warning');
    } else {
      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });
  
      await loading.present ();

      this.auth.resend_verification ().subscribe (async (res: any) => {
        loading.dismiss ();
        console.log (res);
        if (res.status === true) {
          const alert = await this.alertController.create({
            message: this.utils.get_translate ('We have just sent you a validation email to') + ' ' + this.auth.USER_DATA.email + '\n' + this.utils.get_translate ('Please check your spam inbox'),
            buttons: ['OK']
          });
  
          alert.present ();
          this.email_sent = moment ().format ();
          await this.storage.set ('verify-email-sent', moment ().format ());
        } else {

        }
      }, error => {
        loading.dismiss ();
        console.log (error);
      });
    }
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
}
