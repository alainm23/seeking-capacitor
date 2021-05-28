import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestNotificationPage } from './request-notification.page';

const routes: Routes = [
  {
    path: '',
    component: RequestNotificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestNotificationPageRoutingModule {}
