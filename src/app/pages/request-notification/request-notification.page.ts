import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OnesignalService } from '../../services/onesignal.service';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, NavController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-request-notification',
  templateUrl: './request-notification.page.html',
  styleUrls: ['./request-notification.page.scss'],
})
export class RequestNotificationPage implements OnInit {

  constructor (private onesignal: OnesignalService,
    private storage: Storage,
    public auth: AuthService,
    public loadingController: LoadingController,
    public navController: NavController) { }

  ngOnInit () {

  }

  async init_onesignal () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    if (Capacitor.isNativePlatform ()) {
      this.onesignal.init_onesignal (
        {USER_ACCESS: this.auth.USER_ACCESS, USER_DATA: this.auth.USER_DATA}
      ).then ((res: boolean) => {
        loading.dismiss ();
        console.log (res);
        this.navController.navigateRoot ('home');
      });
    } else {
      loading.dismiss ();
      this.navController.navigateRoot ('home');
    }
  }

  later () {

  }
}
