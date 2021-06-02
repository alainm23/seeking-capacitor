import { Component, OnInit, Input } from '@angular/core';

//Services
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.page.html',
  styleUrls: ['./selector.page.scss'],
})
export class SelectorPage implements OnInit {
  @Input () items: any [] = [];
  @Input () type: string = '';

  constructor (private modalController: ModalController) {

  }

  ngOnInit () {
    console.log (this.items);
    console.log (this.type);
  }
}
