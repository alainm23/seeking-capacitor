import { Component, OnInit } from '@angular/core';

// Services
import { ModalController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { CompleteProfilePage } from '../../modals/complete-profile/complete-profile.page';
import { IonRouterOutlet } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { AdmobService } from 'src/app/services/admob.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.page.html',
  styleUrls: ['./profile-menu.page.scss'],
})
export class ProfileMenuPage implements OnInit {
  complete_perfil: any;
  constructor (private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private database: DatabaseService,
    private loadingController: LoadingController,
    public auth: AuthService,
    private storage: Storage,
    private alertController: AlertController,
    private loadingCo1ntroller: LoadingController,
    private navController: NavController,
    private admob: AdmobService) { }

  ngOnInit () {
    
  }

  back () {
    this.navController.back ();
  }

  async complete_profile () {
    this.navController.navigateForward (['edit-profile']);
  }

  async logout () {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Está seguro que desea cerrar sesión?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: async () => {
            const loading = await this.loadingCo1ntroller.create({
              translucent: true,
              spinner: 'lines-small',
              mode: 'ios'
            });

            await loading.present ();

            this.auth.logout ().subscribe (async (res: any) => {
              await loading.dismiss ();
              this.borrar_user_access ();
              this.auth.logout_social ();
            }, async error => {
              await loading.dismiss ();
              this.borrar_user_access ();
              this.auth.logout_social ();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  borrar_user_access () {
    this.storage.clear ().then (() => {
      this.navController.navigateRoot ('login');
    });
  }

  ver_video () {
    // this.admob.rewardVideo ();
  }

  ver_interstitial () {
    // this.admob.interstitial ();
  }

  go_page (page: string) {
    this.navController.navigateForward ([page]);
  }

  root_page (page: string) {
    this.database.tab_selected = 'favorites';
    this.navController.navigateRoot (page);
  }

  async open_upgrade_menu () {
    this.database.open_upgrade_menu ();
  }

  open_select_plan () {
    this.database.open_select_plan ();
  }

  open_buy_credis () {
    this.database.open_buy_credis ();
  }
}
