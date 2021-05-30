import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestFotosPageRoutingModule } from './request-fotos-routing.module';

import { RequestFotosPage } from './request-fotos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestFotosPageRoutingModule
  ],
  declarations: [RequestFotosPage]
})
export class RequestFotosPageModule {}
