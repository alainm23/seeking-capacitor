import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportUserPageRoutingModule } from './report-user-routing.module';

import { ReportUserPage } from './report-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportUserPageRoutingModule
  ],
  declarations: [ReportUserPage]
})
export class ReportUserPageModule {}
