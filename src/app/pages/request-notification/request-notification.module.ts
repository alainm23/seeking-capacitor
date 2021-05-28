import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestNotificationPageRoutingModule } from './request-notification-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { RequestNotificationPage } from './request-notification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestNotificationPageRoutingModule,
    TranslateModule
  ],
  declarations: [RequestNotificationPage]
})
export class RequestNotificationPageModule {}
