import { Component, OnInit } from '@angular/core';

// Services
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { UpgradeAccountMenuPage } from '../../modals/upgrade-account-menu/upgrade-account-menu.page';
import { SelectPlanPage } from '../../modals/select-plan/select-plan.page';
import { BuySingleCreditsPage } from '../../modals/buy-single-credits/buy-single-credits.page';
import { PaymentPage } from '../../modals/payment/payment.page';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  tab_selected: string = 'home';
  constructor (private database: DatabaseService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private auth: AuthService,
    private storage: Storage,
    private navController: NavController) { }

  ngOnInit() {
  }

  set_tab (tab: string) {
    this.tab_selected = tab;
  }

  async open_upgrade_menu () {
    this.tab_selected = 'sale';

    const modal = await this.modalController.create ({
      component: UpgradeAccountMenuPage,
      swipeToClose: true,
      cssClass: 'modal-verify',
      showBackdrop: false,
      mode: 'ios'
    });

    modal.onDidDismiss ().then ((response: any) => {
      this.tab_selected = 'home';

      if (response.role === 'upgrade') {
        this.open_select_plan ();
      } else if (response.role === 'credits') {
        this.open_buy_credis ();
      }
    });

    return await modal.present ();
  }

  async open_select_plan () {
    const modal = await this.modalController.create({
      component: SelectPlanPage,
      componentProps: {
        gender: 0
      }
    });

    modal.onWillDismiss ().then ((response: any) => {
      if (response.role === 'free') {
        
      } else if (response.role === 'free-spirit') {
        this.open_buy_credis ();
      } else if (response.role === 'subscription') {
        this.open_payment (response.data, 'subscription');
      }
    });
    
    return await modal.present ();
  }

  async open_buy_credis () {
    const modal = await this.modalController.create ({
      component: BuySingleCreditsPage,
      componentProps: {
        page: 'home'
      }
    });

    modal.onWillDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.open_payment (response.data, 'credis');
      }
    });
    
    return await modal.present ();
  }

  async open_payment (data: any, type: string) {
    const modal = await this.modalController.create ({
      component: PaymentPage,
      componentProps: {
        data: data,
        type: type
      }
    });

    modal.onWillDismiss ().then (async (response: any) => {
      if (response.role === 'PAID') {
        const loading = await this.loadingController.create ({
          translucent: true,
          spinner: 'lines-small',
          mode: 'ios'
        });
    
        await loading.present ();

        if (response.data.type === 'credis') {
          let request: any = {
            creditos: response.data.data.creditos,
            codigo_transaccion: response.data.response.id,
            total_pagado: response.data.data.value
          };
  
          console.log (request);
  
          this.database.guardar_pago_creditos (request).subscribe (async (res: any) => {
            if (res.status === true) {
              this.auth.USER_DATA.creditos += request.creditos;
              this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
                loading.dismiss ();
                this.navController.navigateRoot (['purchase-message', 'home', JSON.stringify (response.data)]);
              });
            } 
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else {
          let request: any = {
            id_plan: response.data.data.id,
            codigo_transaccion: response.data.response.orderID,
            id_suscripcion: response.data.response.subscriptionID
          };

          this.database.guardar_membresia (request).subscribe ((res: any) => {
            if (res.status === true) {
              this.auth.USER_DATA.membresia = request.id_plan;
              this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
                loading.dismiss ();
                this.navController.navigateRoot (['purchase-message', 'home', JSON.stringify (response.data)]);
              });
            } 
          }, error => {
            console.log (error);
            loading.dismiss ();
          });
          console.log (response);
        }
      }
    });
    
    return await modal.present ();
  }
}
