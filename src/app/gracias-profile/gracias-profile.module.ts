import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GraciasProfilePageRoutingModule } from './gracias-profile-routing.module';

import { GraciasProfilePage } from './gracias-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraciasProfilePageRoutingModule
  ],
  declarations: [GraciasProfilePage]
})
export class GraciasProfilePageModule {}
