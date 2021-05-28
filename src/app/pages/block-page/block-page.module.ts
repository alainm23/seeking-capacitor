import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlockPagePageRoutingModule } from './block-page-routing.module';

import { BlockPagePage } from './block-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlockPagePageRoutingModule
  ],
  declarations: [BlockPagePage]
})
export class BlockPagePageModule {}
