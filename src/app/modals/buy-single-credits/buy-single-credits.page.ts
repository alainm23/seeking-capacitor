import { Component, OnInit } from '@angular/core';

// Services
import { LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-buy-single-credits',
  templateUrl: './buy-single-credits.page.html',
  styleUrls: ['./buy-single-credits.page.scss'],
})
export class BuySingleCreditsPage implements OnInit {
  prices: any [] = [];
  constructor (private modalController: ModalController,
    public auth: AuthService,
    public database: DatabaseService,
    public loadingController: LoadingController) { }

  async ngOnInit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.get_datos ('paquete_creditos').subscribe ((res: any []) => {
      console.log (res);
      loading.dismiss ();
      this.prices = res;
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  select_price (item: any) {
    this.modalController.dismiss (item, 'ok');
  }

  close () {
    this.modalController.dismiss ();
  }
}
