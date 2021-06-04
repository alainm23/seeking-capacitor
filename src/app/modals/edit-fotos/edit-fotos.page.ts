import { Component, OnInit } from '@angular/core';

// Services
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-edit-fotos',
  templateUrl: './edit-fotos.page.html',
  styleUrls: ['./edit-fotos.page.scss'],
})
export class EditFotosPage implements OnInit {

  constructor (public modalController: ModalController,
    private auth: AuthService,
    private database: DatabaseService,
    private storage: Storage) { }

  ngOnInit () {
    this.auth.get_fields (['foto_perfil', 'galeria']).subscribe ((res: any) => {
      console.log (res);
    });
  }

  back () {
    this.modalController.dismiss ();
  }
}
