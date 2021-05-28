import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuySingleCreditsPageRoutingModule } from './buy-single-credits-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { BuySingleCreditsPage } from './buy-single-credits.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuySingleCreditsPageRoutingModule,
    TranslateModule
  ],
  declarations: [BuySingleCreditsPage]
})
export class BuySingleCreditsPageModule {}
