import { Component, OnInit } from '@angular/core';

import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';

// Services
import { DatabaseService } from '../../services/database.service';
import { FilterPage } from '../../modals/filter/filter.page';
import * as moment from 'moment';
import { CompleteProfilePage } from '../../modals/complete-profile/complete-profile.page';
import { UpgradeAccountMenuPage } from '../../modals/upgrade-account-menu/upgrade-account-menu.page';
import { SelectPlanPage } from '../../modals/select-plan/select-plan.page';
import { BuySingleCreditsPage } from '../../modals/buy-single-credits/buy-single-credits.page';
import { PaymentPage } from '../../modals/payment/payment.page';
import { AuthService } from '../../services/auth.service';
import { Storage } from '@ionic/storage-angular';
// import { AdmobService } from '../../services/admob.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  producto = {
    descripcion: 'ascaosckaos',
    precio: 99.99
  }

  slideOpts = {
    initialSlide: 3,
    slidesPerView: 2.5,
    spaceBetween: 9,
  };

  items: any [] = [];
  promovidos: any [] = [];
  home_loading: boolean = false;
  promovidos_loading: boolean = false;
  page: number = 0;
  tab_filter: string = null;
  order_by: string = 'favoritos-desc';
  location: any = null;
  relationship: number [] = [];
  idiomas: number [] = [];
  personalidad_map: Map <string, number []> = new Map <string, number []> ();
  apariencia_map: Map <string, number []> = new Map <string, number []> ();
  extra_map: Map <string, number []> = new Map <string, number []> ();
  bestMatches: boolean = false;
  length_page: number = 20;
  edad_range: any = { lower: 18, upper: 50 };
  complete_perfil: any;
  loading_complete_perfil: boolean = false;
  constructor (private database: DatabaseService,
    private loadingController: LoadingController,
    private navController: NavController,
    private modalController: ModalController,
    private toastController: ToastController,
    private auth: AuthService,
    private storage: Storage) { }

  async ngOnInit () {
    this.loading_complete_perfil = true;
    this.home_loading = true;
    this.get_data (null, false, '');
    // this.get_promovidos ();
    
    this.database.get_porcentaje_perfil ().subscribe (async (res: any) => {
      console.log (res);
      this.complete_perfil = res.porcentaje_perfil;
      console.log (this.complete_perfil);
      this.loading_complete_perfil = false;
    }, error => {
      console.log (error);
    });
  }

  // banner () {
  //   this.admobService.MostrarBanner ();
  // }

  // MostrarInterstitial () {
  //   this.admobService.MostrarInterstitial ();
  // }

  // MostrarReward () {
  //   this.admobService.MostrarRewardVideo ();
  // }

  // MostrarReward2 () {
  //   this.admobService.MostrarRewardVideo ();
  // }

  // MostrarReward3 () {
  //   this.admobService.MostrarRewardVideo ();
  // }

  async complete_profile () {
    const modal = await this.modalController.create ({
      component: CompleteProfilePage,
      swipeToClose: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios'
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'update') {
        this.loading_complete_perfil = true;
        this.database.get_porcentaje_perfil ().subscribe (async (res: any) => {
          console.log (res);
          this.complete_perfil = res.porcentaje_perfil;
          console.log (this.complete_perfil);
          this.loading_complete_perfil = false;
        }, error => {
          console.log (error);
        });
      }
    });

    return await modal.present ();
  }

  get_data (event: any, join: boolean, type: string) {
    if (type === 'refresher') {
      // event.target.disabled = false;
      this.page = 1;
    } else if (type === 'infinite-scroll') {
      event.target.disabled = false;
      this.page = this.page + 1;
    } else {
      this.page = this.page + 1;
    }
    
    this.database.get_home_profiles (this.get_filter_data ()).subscribe ((res: any []) => {
      console.log (res);
      if (join) {
        res.forEach ((e: any) => {
          this.items.push (e);
        });

        if (type === 'infinite-scroll' && res.length < this.length_page) {
          // event.target.disabled = true;
        }
      } else {
        this.items = res;
      }

      if (event === null) {
        this.home_loading = false;
      } else {
        event.target.complete ();
      }
    }, error => {
      console.log (error);
      if (event === null) {
        this.home_loading = false;
      } else {
        event.target.complete ();
      }
    });
  }

  get_date_format (date_string: string, format: string) {
    if (date_string === null || date_string === undefined || date_string === '') {
      return '';
    }

    let date = moment (date_string);

    if (!date.isValid ()) {
      return '';
    }

    return date.format (format);
  }

  get_relative_format (date_string: string) {
    if (date_string === null || date_string === undefined || date_string === '') {
      return '';
    }

    let date = moment (date_string);

    if (!date.isValid ()) {
      return '';
    }

    return date.fromNow ();
  }

  get_filter_data () {
    let request: any = {
      page: this.page,
      orden: this.order_by,
      tab: this.tab_filter,
      bestMatches: this.bestMatches,
      length_page: this.length_page,
      relationship: this.relationship,
      idiomas: this.idiomas,
      rango_edad: [this.edad_range.lower, this.edad_range.upper]
    };

    if (this.location !== null) {
      request.location = this.location
    }

    if (this.bestMatches === false) {
      delete request.bestMatches;
    }

    if (this.relationship.length <= 0) {
      delete request.relationship;
    }

    if (this.idiomas.length <= 0) {
      delete request.idiomas;
    }

    let personalidad: number [] = [];
    this.personalidad_map.forEach ((value: any []) => {
      value.forEach ((value: number) => {
        personalidad.push (value);
      });
    });

    if (personalidad.length > 0) {
      request.personalidad = personalidad;
    }

    let apariencia: number [] = [];
    this.apariencia_map.forEach ((value: any []) => {
      value.forEach ((value: number) => {
        apariencia.push (value);
      });
    });

    if (apariencia.length > 0) {
      request.apariencia = apariencia;
    }

    let extras: number [] = [];
    this.extra_map.forEach ((value: any []) => {
      value.forEach ((value: number) => {
        extras.push (value);
      });
    });

    if (extras.length > 0) {
      request.extras = extras;
    }
    
    console.log (request);

    return request;
  }

  get_promovidos () {
    this.promovidos_loading = true;
    this.database.get_home_promovidos ().subscribe ((res: any []) => {
      this.promovidos = res;
      this.promovidos_loading = false;
    }, error => {
      this.promovidos_loading = false;
      console.log (error);
    });
  }

  view_profile (item: any) {
    console.log (item);
    this.navController.navigateForward (['profile', item.id]);
  }

  get_photo (image: any) {
    if (image === null || image === undefined) {
      return '';
    }

    return this.database.URL_STORAGE + image;
  }

  change_order ($event) {
    this.items = [];
    this.page = 0;
    this.home_loading = true;
    this.get_data (null, false, '');
  }

  async filtrar () {
    const loading = await this.loadingController.create ({
      translucent: true,
      mode: 'ios'
    });
    
    await loading.present ();

    const modal = await this.modalController.create ({
      component: FilterPage,
      componentProps: {
        page: 'home',
        relationship: this.relationship,
        idiomas: this.idiomas,
        personalidad_map: this.personalidad_map,
        apariencia_map: this.apariencia_map,
        extra_map: this.extra_map,
        edad_range: this.edad_range,
        location: this.location
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'filter') {
        this.relationship = response.data.relationship;
        this.personalidad_map = response.data.personalidad_map;
        this.apariencia_map = response.data.apariencia_map;
        this.extra_map = response.data.extra_map;
        this.idiomas = response.data.idiomas;
        this.edad_range = response.data.edad_range;
        this.location = response.data.location;
        this.items = [];
        this.page = 0;
        this.home_loading = true;
        this.get_data (null, false, '');
      }
    });

    return await modal.present ().then (() => {
      loading.dismiss ();
    });
  }

  set_tab (filter: string) {
    this.items = [];
    this.page = 0;
    this.tab_filter = filter;
    this.home_loading = true;
    this.get_data (null, false, '');
  }

  toggled_favorite (item: any) {
    item.tengo_favorito = !item.tengo_favorito;
    this.database.set_favorite (item.id).subscribe ((res: any) => {
      if (res.status !== true) {
        item.tengo_favorito = !item.tengo_favorito;
        this.presentToast ('Unable to set favorite, try one more time.', 'danger');
      }
    }, error => {
      item.tengo_favorito = !item.tengo_favorito;
      this.presentToast ('Unable to set favorite, try one more time.', 'danger');
    });
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 2500,
      position: 'top'
    });

    toast.present ();
  }

  send_wink (item: any) {
    if (item.wink_loading === undefined) {
      item.wink_loading = true;
    } else {
      item.wink_loading = !item.wink_loading;
    }

    this.database.send_wink (item.id).subscribe ((res: any) => {
      console.log (res);
      item.wink_loading = false;
      this.presentToast (res.message, res.status === true ? 'success' : 'danger');
    }, error => {
      item.wink_loading = false;
      console.log (error);
    });
  }

  toggle_best_matches () {
    this.bestMatches = !this.bestMatches;
    this.items = [];
    this.page = 0;
    this.home_loading = true;
    this.get_data (null, false, '');
  }

  async open_upgrade_menu () {
    this.database.open_upgrade_menu ();
  }
}
