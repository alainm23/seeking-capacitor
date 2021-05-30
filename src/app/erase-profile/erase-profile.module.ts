import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EraseProfilePageRoutingModule } from './erase-profile-routing.module';

import { EraseProfilePage } from './erase-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EraseProfilePageRoutingModule
  ],
  declarations: [EraseProfilePage]
})
export class EraseProfilePageModule {}
