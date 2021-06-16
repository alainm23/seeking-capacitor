import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../../services/auth.service';
import { EditProfileFormPage }from '../../modals/edit-profile-form/edit-profile-form.page';
import { EditFotosPage } from '../../modals/edit-fotos/edit-fotos.page';
import { LoadingController, ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  profile: any = {};
  galeria: any [] = [];

  data: string [] = ['id', 'usernick', 'edad',
    'altura', 'idiomas', 'foto_perfil',
    'metric_system', 'name', 'nombre_ciudad',
    'nombre_pais', 'estoy_buscando', 'intereses', 'acerca_de_mi',
    'personalidades', 'apariencias', 'generos_interes', 'relaciones', 'galeria'];
  constructor (private auth: AuthService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private navController: NavController) { }

  async ngOnInit() {
    this.update_fields ();
  }

  async update_fields () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.auth.get_fields (this.data).subscribe ((res: any) => {
      console.log (res);
      this.profile = res;

      this.galeria.push ({
        imagen: res.foto_perfil
      });

      if (res.galeria !== undefined && res.galeria !== null) {
        this.galeria = this.galeria.concat (res.galeria);
      }

      loading.dismiss ();
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  async edit_modal (form: string) {
    if (form === 'galeria') {
      const modal = await this.modalController.create ({
        component: EditFotosPage,
        componentProps: {
          foto_perfil: this.profile.foto_perfil,
          galeria: this.profile.galeria
        },
        swipeToClose: true,
        mode: 'ios'
      });
  
      modal.onDidDismiss ().then ((response: any) => {
        this.update_fields ();
      });
  
      return await modal.present ();
    } else {
      const modal = await this.modalController.create ({
        component: EditProfileFormPage,
        componentProps: {
          form: form
        },
        swipeToClose: true,
        mode: 'ios'
      });
  
      modal.onDidDismiss ().then ((response: any) => {
        if (response.role === 'update') {
          this.update_fields ();
        }
      });
  
      return await modal.present ();
    }
  }

  back () {
    this.navController.back ();
  }
}
