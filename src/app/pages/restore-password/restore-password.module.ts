import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RestorePasswordPageRoutingModule } from './restore-password-routing.module';
import { RestorePasswordPage } from './restore-password.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RestorePasswordPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [RestorePasswordPage]
})
export class RestorePasswordPageModule {}
