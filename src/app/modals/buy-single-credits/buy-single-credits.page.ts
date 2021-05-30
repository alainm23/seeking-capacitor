import { Component, OnInit } from '@angular/core';

// Services
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-buy-single-credits',
  templateUrl: './buy-single-credits.page.html',
  styleUrls: ['./buy-single-credits.page.scss'],
})
export class BuySingleCreditsPage implements OnInit {
  prices: any [] = [
    {
      text: '20 Credits',
      value: 19.99,
      creditos: 20
    },
    {
      text: '50 Credits',
      value: 29.99,
      creditos: 50
    },
    {
      text: '75 Credits',
      value: 39.99,
      creditos: 75
    },
    {
      text: '100 Credits',
      value: 52.99,
      creditos: 100
    }
  ]
  constructor (private modalController: ModalController,
    public auth: AuthService) { }

  ngOnInit() {
  }

  select_price (item: any) {
    this.modalController.dismiss (item, 'ok');
  }

  close () {
    this.modalController.dismiss ();
  }
}
