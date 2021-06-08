import { Component, OnInit } from '@angular/core';
import { NavController} from '@ionic/angular';

@Component({
  selector: 'app-settings-notifications',
  templateUrl: './settings-notifications.page.html',
  styleUrls: ['./settings-notifications.page.scss'],
})
export class SettingsNotificationsPage implements OnInit {

  constructor(private navController: NavController,) { }

  ngOnInit() {
  }

  view_profile () {
    this.navController.back();
  }

}
