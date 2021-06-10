import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-settings-notifications',
  templateUrl: './settings-notifications.page.html',
  styleUrls: ['./settings-notifications.page.scss'],
})
export class SettingsNotificationsPage implements OnInit {
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

  news_and_events_notifications: any = {
    alert: false,
    email: false
  }

  promotions_notifications: any = {
    alert: false,
    email: false
  };

  constructor (private navController: NavController,
    private database: DatabaseService,
    private loadingController: LoadingController,
    private auth: AuthService) { }

  async ngOnInit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.get_settings ().subscribe (async (res: any) => {
      console.log (res);

      this.winks_notifications = res.winks_notifications;
      this.favorites_notifications = res.favorites_notifications;
      this.message_notifications = res.message_notifications;
      this.members_and_matches_notifications = res.members_and_matches_notifications;
      this.profile_changes_notifications = res.profile_changes_notifications;
      this.verification_and_information_notifications = res.verification_and_information_notifications;
      this.profile_notifications = res.profile_notifications;
      this.news_and_events_notifications = res.news_and_events_notifications;
      this.promotions_notifications = res.promotions_notifications;

      await loading.dismiss ();
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  view_profile () {
    this.navController.back ();
  }

  update_check (event: any, object: any, name: string, campo: string) {
    object [campo] = event.detail.checked;

    let request: any = {};
    request.campo = name;
    request.valor = object;

    console.log (request);

    this.auth.save_settings (request).subscribe ((res: any) => {
      console.log (res);
    }, error => {
      console.log (error);
    });
  }
}
