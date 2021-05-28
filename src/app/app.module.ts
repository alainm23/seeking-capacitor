import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Storage
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { OneSignal } from '@ionic-native/onesignal/ngx';

// Form
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';

//Translation
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Modals
import { FilterPageModule } from './modals/filter/filter.module';
import { ChatPageModule } from './modals/chat/chat.module';
import { CompleteProfilePageModule } from './modals/complete-profile/complete-profile.module';
import { SelectPlanPageModule } from './modals/select-plan/select-plan.module';
import { BuySingleCreditsPageModule } from './modals/buy-single-credits/buy-single-credits.module';
import { UpgradeAccountMenuPageModule } from './modals/upgrade-account-menu/upgrade-account-menu.module';
import { PaymentPageModule } from './modals/payment/payment.module';
import { EditProfileFormPageModule } from './modals/edit-profile-form/edit-profile-form.module';
import { EditFotosPageModule } from './modals/edit-fotos/edit-fotos.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot (),
    HttpClientModule,
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    OrderModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [ HttpClient ]
      }
    }),
    FilterPageModule,
    ChatPageModule,
    CompleteProfilePageModule,
    SelectPlanPageModule,
    BuySingleCreditsPageModule,
    UpgradeAccountMenuPageModule,
    PaymentPageModule,
    EditProfileFormPageModule,
    EditFotosPageModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    OneSignal
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
