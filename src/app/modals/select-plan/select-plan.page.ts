import { Component, OnInit, Input, ViewChild } from '@angular/core';

// Services
import { LoadingController, ModalController, AlertController, IonSlides } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-select-plan',
  templateUrl: './select-plan.page.html',
  styleUrls: ['./select-plan.page.scss'],
})
export class SelectPlanPage implements OnInit {
  @ViewChild (IonSlides, { static: false }) slides: IonSlides;
  @Input () page: string; 
  planes: any [] = [];
  slideOpts = {
    initialSlide: 3,
    slidesPerView: 1.3,
    spaceBetween: 10,
    centeredSlides: true,
    breakpoints: {
      411: {
        spaceBetween: 10,
      },
      414: {
        slidesPerView: 1.5,
        spaceBetween: 10
      },
      // when window width is >= 480px
      480: {
        slidesPerView: 1.5,
        spaceBetween: 10
      },
      540: {
        slidesPerView: 2,
        spaceBetween: 10
      },
      // when window width is >= 640px
      768: {
        slidesPerView: 2,
        spaceBetween: 40
      }
    }
  };
  lang: string;
  membresia: any;
  constructor (private modalController: ModalController,
    private database: DatabaseService,
    private loadingController: LoadingController,
    private storage: Storage,
    private auth: AuthService,
    private alertController: AlertController) { }
  
  async ngOnInit () {
    this.storage.get ('lang').then (async (lang: string) => {
      this.lang = lang;
      if (lang === undefined || lang === null) {
        this.lang = 'en';
      }

      this.membresia = this.auth.USER_DATA.membresia;

      console.log (this.page);
      console.log (this.membresia);

      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });

      await loading.present ();

      this.database.get_datos ('planes', this.lang).subscribe ((res: any []) => {
        console.log (res);
        this.planes = res;
        loading.dismiss ();

        if (this.page === 'home') {
          if (this.membresia > 0) {
            setTimeout (() => {
              this.slides.slideTo (this.membresia + 1);
            }, 250);
          } else {
            setTimeout (() => {
              this.slides.slideTo (0);
            }, 250);
          }
        } else {
          setTimeout (() => {
            this.slides.slideTo (0);
          }, 250);
        }
      }, error => {
        loading.dismiss ();
        console.log (error);
      });
    });
  }

  async select_plan (plan: string, item: any=null) {
    if (plan === 'free-spirit') {
      this.modalController.dismiss (item, plan);
      return;
    }

    if (this.membresia === 0) {
      this.modalController.dismiss (item, plan);
    } else {
      if (plan === 'free') {
        this.cancel_plan_confirm ();
      } else {
        const alert = await this.alertController.create ({
          header: 'Confirm Operation',
          message: '¿Are you sure you want to change plan?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            }, {
              text: 'Confirm',
              handler: () => {
                this.modalController.dismiss (item, plan);
              }
            }
          ]
        });
    
        await alert.present ();
      }
    }
  }

  async cancel_plan_confirm () {
    const alert = await this.alertController.create ({
      header: 'Confirm Operation',
      message: '¿Are you sure you want to cancel you current plans?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Confirm',
          handler: () => {
            this.cancel_plan_submit ();
          }
        }
      ]
    });

    await alert.present ();
  }

  async cancel_plan_submit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.cancelar_mebresia ().subscribe ((res: any) => {
      console.log (res);
      if (res.status === true) {
        this.auth.USER_DATA.membresia = null;
        this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
          loading.dismiss ();
        });
      } else {
        loading.dismiss ();
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  close () {
    this.modalController.dismiss ();
  }
}
