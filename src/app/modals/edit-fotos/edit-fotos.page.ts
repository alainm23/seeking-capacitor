import { Component, OnInit, Input } from '@angular/core';

// Services
import { ActionSheetController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Storage } from '@ionic/storage-angular';
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-edit-fotos',
  templateUrl: './edit-fotos.page.html',
  styleUrls: ['./edit-fotos.page.scss'],
})
export class EditFotosPage implements OnInit {
  @Input () foto_perfil: string;
  @Input () galeria: any [] = [];
  constructor (public modalController: ModalController,
    private auth: AuthService,
    private database: DatabaseService,
    private storage: Storage,
    private actionSheetController: ActionSheetController,
    private utils: UtilsService,
    private loadingController: LoadingController,
    private toastController: ToastController) { }

  ngOnInit () {
    console.log (this.foto_perfil);
    console.log (this.galeria);
  }

  back () {
    this.modalController.dismiss ();
  }

  async selectImageSource (type: string) {
    if (Capacitor.isNativePlatform ()) {
      const actionSheet = await this.actionSheetController.create ({
        buttons: [{
          text: this.utils.get_translate ('Take a picture'),
          icon: 'camera',
          handler: () => {
            this.takePicture (CameraSource.Camera, type);
          }
        }, {
          text: this.utils.get_translate ('Select a photo'),
          icon: 'images',
          handler: () => {
            this.takePicture (CameraSource.Photos, type);
          }
        }]
      });
  
      await actionSheet.present ();
    } else {
      // fileInput.click ();
    }
  }

  async takePicture (sourceType: CameraSource, type: string) {
    const options: ImageOptions = {
      quality: 90,
      height: 640,
      width: 480,
      preserveAspectRatio: true,
      source: sourceType,
      correctOrientation: true,
      resultType: CameraResultType.Base64
    };

    let image = await Camera.getPhoto (options);

    console.log (image);
    console.log (image.base64String);

    let file: any = {
      webPath: 'data:image/jpeg;base64,' + image.base64String,
      blob: this.b64toBlob (image.base64String, `image/${image.format}`),
      name: new Date ().getTime ().toString ()
    };

    console.log (file);

    if (type === 'profile') {
      this.valid_image (file);
    } else {
      const formData: FormData = new FormData ();
      formData.append ('seccion', 'galeria');
      formData.append ('galeria[]', file.blob, file.name);

      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });
  
      await loading.present ();
      
      this.database.edit_profile (formData).subscribe ((res: any) => {
        console.log (res);
        loading.dismiss ();
        if (res.status === true) {
          this.galeria.push (res.galeria [0]);
        }
      }, error => {
        loading.dismiss ();
        console.log (error);
      });
    }
  }

  b64toBlob (b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
 
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
 
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
 
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
 
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async valid_image (file: any) {
    const formData: FormData = new FormData ();
    formData.append ('campo', 'imagen');
    // formData.append ('lang', this.lang);
    formData.append ('imagen', file.blob, file.name);

    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.valid_photo (formData).subscribe ((res: any) => {
      if (res.status === true) {
        const formData: FormData = new FormData ();
        formData.append ('seccion', 'imagen');
        formData.append ('imagen', file.blob, file.name);

        this.database.edit_profile (formData).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();
          if (res.status === true) {
            this.foto_perfil = file.webPath;
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else {
        loading.dismiss ();
        this.presentToast (res.message, 'danger');
      }
    }, error => {
      console.log (error);
      loading.dismiss ();
      this.show_api_error (error.error, ['imagen']);
    });
  }

  show_api_error (res: any, values: string []) {
    values.forEach ((value: string) => {
      if (res.errors [value]) {
        res.errors [value].forEach ((error: string) => {
          this.presentToast (error, 'danger');
        });
      }
    });
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 2000,
      position: 'top'
    });

    toast.present ();
  }

  async delete_image (item: any) {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    let request: any = {
      seccion: "borrar_imagen_galeria",
      id: item.id
    };

    this.database.edit_profile (request).subscribe ((res: any) => {
      console.log (res);
      loading.dismiss ();

      if (res.status === true) {
        this.galeria = this.galeria.filter ((obj: any) => {
          return obj.id !== item.id;
        });
      }
    }, error => {
      console.log (error);
      loading.dismiss ();
    });
  }

  change_acceso (item: any) {
    item.acceso = !item.acceso;

    let request: any = {
      seccion: "cambiar_acceso_image_galeria",
      id: item.id,
      acceso: item.acceso
    };

    this.database.edit_profile (request).subscribe ((res: any) => {
      console.log (res);
      if (res.status !== true) {
        item.acceso = !item.acceso;
      }
    }, error => {
      console.log (error);
      item.acceso = !item.acceso;
    });
  }
}
