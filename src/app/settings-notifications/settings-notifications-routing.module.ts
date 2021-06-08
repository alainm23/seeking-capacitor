import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsNotificationsPage } from './settings-notifications.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsNotificationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsNotificationsPageRoutingModule {}
