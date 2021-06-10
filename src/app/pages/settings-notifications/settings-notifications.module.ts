import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsNotificationsPageRoutingModule } from './settings-notifications-routing.module';

import { SettingsNotificationsPage } from './settings-notifications.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsNotificationsPageRoutingModule,
    TranslateModule
  ],
  declarations: [SettingsNotificationsPage]
})
export class SettingsNotificationsPageModule {}
