import { Component, OnInit, ViewChild } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { IonSlides, Platform, ToastController, LoadingController, IonInput, ModalController, ActionSheetController, NavController } from '@ionic/angular'; 
import { report } from 'process';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from 'src/app/services/auth.service';
import { SelectorPage } from '../../modals/selector/selector.page';
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.page.html',
  styleUrls: ['./complete-profile.page.scss'],
})
export class CompleteProfilePage implements OnInit {
  @ViewChild (IonSlides, { static: false }) ion_slides: IonSlides;

  slideOpts = {
    initialSlide: 0,
    duration: 400
  };

  index: number = 0;
  slides: any [] = [];
  _slides: any [] = [];
  idiomas: any [] = [];
  extras: any [] = [];
  intereses: any [] = [];
  apariencia_items: any [] = [];
  personalidad_items: any [] = [];
  apariencias: any [] = [];
  personalidades: any [] = [];
  alturas: any [] = [];

  intereses_map: Map <string, boolean> = new Map <string, boolean> ();
  idiomas_map: Map <string, boolean> = new Map <string, boolean> ();
  apariencia_map: Map <string, number> = new Map <string, number> ();
  personalidad_map: Map <string, number> = new Map <string, number> ();

  estoy_buscando: string = '';
  regalo_recibir: string = '';
  personal_data_form: FormGroup;
  extras_form: FormGroup;

  loading: boolean = true;
  apariencias_found: boolean = false;
  personalidades_found: boolean = false;

  photos: any [] = ['', ''];
  constructor (private database: DatabaseService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private utils: UtilsService,
    private auth: AuthService,
    private actionSheetController: ActionSheetController,
    private storage: Storage) { }

  ngOnInit () {
    console.log (this.auth.USER_DATA);

    // for (let index = 0; index < this.auth.USER_DATA.galeria.length; index++) {
    //   this.photos [index] = this.auth.USER_DATA.galeria [index];
    // }

    console.log (this.photos);

    this.personal_data_form = new FormGroup ({
      name: new FormControl ('', []),
      telefono: new FormControl ('', []),
      acerca_de_mi: new FormControl ('', [Validators.required]),
      altura: new FormControl ('1.60', [Validators.required]),
      sistema: new FormControl ('', [Validators.required]),
    });

    if (this.auth.USER_DATA.metric_system === 1) {
      this.personal_data_form.controls ['sistema'].setValue ('metric');
    } else {
      this.personal_data_form.controls ['sistema'].setValue ('imperial');
    }

    this.extras_form = new FormGroup ({
      relocate: new FormControl ('', []),
      passport_ready: new FormControl ('', [])
    });

    this.database.get_data_faltante ().subscribe ((res: any) => {
      console.log (res);

      // this.slides.push ('intereses');
      // this.slides.push ('estoy_buscando');
      // this.slides.push ('personal_data');

      res.datos.forEach ((item: any) => {
        if (typeof item === 'string') {
          this._slides.push (item);
          this.slides.push (item);
        } else if (Array.isArray (item)) {
          item.forEach ((e: any) => {
            this._slides.push (e.name_space + e.id);

            if (e.name_space === 'apariencia_') {
              this.apariencias.push (e);
              if (this.slides.find (x => x === 'apariencia') === undefined) {
                this.slides.push ('apariencia');
              }
            } else if (e.name_space === 'personalidad_') {
              this.personalidades.push (e);
              if (this.slides.find (x => x === 'personalidad') === undefined) {
                this.slides.push ('personalidad');
              }
            }
          });
        }
      });

      this.apariencias.forEach ((e: any) => {
        this.apariencia_items [e.name_space + e.id] = {
          id: e.id,
          items: e.items
        };
      });

      this.personalidades.forEach ((e: any) => {
        this.personalidad_items [e.name_space + e.id] = {
          id: e.id,
          items: e.items
        };
      });

      if (res ['datos_personal_data'] !== undefined && res ['datos_personal_data'] !== null) {
        this.personal_data_form.controls ['name'].setValue (res ['datos_personal_data'].name);
        this.personal_data_form.controls ['telefono'].setValue (res ['datos_personal_data'].telefono);
        this.personal_data_form.controls ['acerca_de_mi'].setValue (res ['datos_personal_data'].acerca_de_mi);
        this.personal_data_form.controls ['altura'].setValue (res ['datos_personal_data'].altura);

        if (res ['datos_personal_data'].metric_system === 1) {
          this.personal_data_form.controls ['sistema'].setValue ('metric'); 
        }
      }

      this.idiomas = res.idiomas;
      this.extras = res.extras;
      this.loading = false;

      this.slides.push ('gracias');

      console.log (this.slides);
      console.log (this._slides);
    }, error => {
      this.loading = false;
      console.log (error);
    });

    this.get_datos ();
  }

  async delete_image (index: number) {
    console.log (this.photos [index]);

    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    loading.present ();

    let request: any = {
      seccion: "borrar_imagen_galeria",
      id: this.photos [index].id
    };

    this.database.edit_profile (request).subscribe ((res: any) => {
      loading.dismiss ();
      console.log (res);
      if (res.status === true) {
        this.photos [index] = '';
        this.auth.update_user ();
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
  }

  get_photos_index (index: number) {
    return this.photos [index];
  }

  async selectImageSource (type: string, index: number=0, fileInput: any=null) {
    if (Capacitor.isNativePlatform ()) {
      const actionSheet = await this.actionSheetController.create ({
        buttons: [{
          text: 'Take a picture',
          icon: 'camera',
          handler: () => {
            this.takePicture (CameraSource.Camera, type, index);
          }
        }, {
          text: 'Select a photo',
          icon: 'images',
          handler: () => {
            this.takePicture (CameraSource.Photos, type, index);
          }
        }]
      });
  
      await actionSheet.present ();
    } else {
      fileInput.click ();
    }
  }

  async takePicture (sourceType: CameraSource, type: string, index: number=0) {
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

    const formData: FormData = new FormData ();
    formData.append ('step', 'galeria');
    formData.append ('galeria[]', file.blob, file.name);
  
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.save_step_modal (formData).subscribe ((res: any) => {
      console.log (res);
      if (res.status === true) {
        loading.dismiss ();
        this.photos [index] = res.galeria [0];
      } else {
        loading.dismiss ();
      }
    }, error => {
      loading.dismiss ();
      console.log (error);
    });
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

  async changeListener (event: any, index: number) {
    if (event.target.files.length > 0) {
      let file = event.target.files [0];

      const formData: FormData = new FormData ();
      formData.append ('step', 'galeria');
      formData.append ('galeria[]', file, file.name);
    
      const loading = await this.loadingController.create ({
        message: ''
      });
  
      await loading.present ();

      this.database.save_step_modal (formData).subscribe (async (res: any) => {
        console.log (res);
        if (res.status === true) {
          loading.dismiss ();
          this.photos [index] = res.galeria [0];
          this.auth.USER_DATA.galeria.push (res.galeria [0]);
          await this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA));
        } else {
          loading.dismiss ();
        }
      }, error => {
        loading.dismiss ();
        console.log (error);
      });
    }
  }

  getBase64 (file: any, index) {
    var reader = new FileReader ();
    reader.readAsDataURL (file);
    
    reader.onload = () => {
      this.photos [index] = reader.result;
    };
    
    reader.onerror = (error) => {
      console.log (error);
    };
  }

  get_datos () {
    this.database.get_datos ('intereses').subscribe ((res: any) => {
      this.intereses = res;
    }, error => {
      console.log (error);
    });

    this.database.get_datos ('alturas').subscribe ((res: any) => {
      // console.log (res);
      this.alturas = res;
    }, error => {
      console.log (error);
    });
  }

  slides_changed (event: any) {
    this.ion_slides.getActiveIndex ().then ((index: number) => {
      this.index = index;
      console.log (this.index);
    });
  }

  checkbox_changed (event: any, id: string, map: Map <string, boolean>) {
    if (event.detail.checked) {
      map.set (id, true);
    } else {
      if (map.has (id)) {
        map.delete (id);
      }
    }
  }

  valid_step (slide: string) {
    let returned: boolean = false;

    if (slide === 'intereses') {
      if (this.intereses_map.size <= 0) {
        this.presentToast (this.utils.get_translate ('Select at least one option'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'estoy_buscando') {
      if (this.estoy_buscando.trim ().split ('').length <= 0) {
        this.presentToast (this.utils.get_translate ('The field is required'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'personal_data') {
      if (this.personal_data_form.invalid) {
        this.presentToast (this.utils.get_translate ('The personal data is required'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'apariencia') {
      let sub_slide = this._slides [this.index];
      console.log (sub_slide);

      if (this.apariencia_map.has (sub_slide)) {
        returned = true;
      } else {
        (this.utils.get_translate ('Select one option'), 'danger');
      }
    } else if (slide === 'personalidad') {
      let sub_slide = this._slides [this.index];
      console.log (sub_slide);

      if (this.personalidad_map.has (sub_slide)) {
        returned = true;
      } else {
        (this.utils.get_translate ('Select one option'), 'danger');
      }
    } else if (slide === 'idiomas') {
      if (this.idiomas_map.size <= 0) {
        this.presentToast (this.utils.get_translate ('The given data was invalid'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'regalo_recibir') {
      if (this.regalo_recibir.trim ().split ('').length <= 0) {
        this.presentToast (this.utils.get_translate ('The given data was invalid'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'extras') {
      if (this.extras_form.invalid) {
        this.presentToast (this.utils.get_translate ('The given data was invalid'), 'danger');
      } else {
        returned = true;
      }
    } else if (slide === 'galeria') {
      returned = true;

      for (let index = 0; index < this.photos.length; index++) {
          if (this.photos [index] === '') {
            returned = false;
          }
      }

      if (returned === false) {
        this.presentToast (this.utils.get_translate ('The given data was invalid'), 'danger');
      }
    } else if (slide === 'gracias') {
      returned = true;
    }

    return returned;
  }

  get_valid_step_array (slide: string, array: any []) {
    let returned: boolean = false;

    array.forEach ((e: any) => {
      if (e.name === slide) {
        returned = true;
      }
    });

    return returned;
  }

  async next_step () {
    let slide: string = this._slides [this.index];

    console.log (slide);
    
    if (slide === undefined) {
      this.modalController.dismiss (null, 'update');
      return;
    }

    if (slide.indexOf ('personalidad_') > -1) {
      slide = 'personalidad';
    } else if (slide.indexOf ('apariencia_') > -1) {
      slide = 'apariencia';
    }

    console.log (slide);

    if (this.valid_step (slide)) {
      const loading = await this.loadingController.create ({
        message: ''
      });
  
      await loading.present ();

      if (slide === 'intereses') {
        let intereses: number [] = [];
        this.intereses_map.forEach ((value: boolean, key: string) => {
          intereses.push (parseInt (key));
        });

        let request: any = {};
        request.step = slide;
        request.intereses = intereses;

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['intereses']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'estoy_buscando') {
        let request: any = {};
        request.step = slide;
        request.estoy_buscando = this.estoy_buscando;

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['estoy_buscando']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'personal_data') {
        let request: any = this.personal_data_form.value;
        request.step = slide;

        if (request.sistema === 'metric') {
          request.altura = request.altura;
        } else {
          request.altura_metros = request.altura;
        }

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['estoy_buscando']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'apariencia') {
        let sub_slide = this._slides [this.index];
        let request: any = {};
        request.step = 'apariencias';
        request [sub_slide] = this.apariencia_map.get (sub_slide);

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            // this.show_api_error (res, ['apariencias']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'personalidad') {
        let sub_slide = this._slides [this.index];
        let request: any = {};
        request.step = 'personalidades';
        request [sub_slide] = this.personalidad_map.get (sub_slide);

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            // this.show_api_error (res, ['apariencias']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'idiomas') {
        let idiomas: number [] = [];
        this.idiomas_map.forEach ((value: boolean, key: string) => {
          idiomas.push (parseInt (key));
        });

        let request: any = {};
        request.step = slide;
        request.idiomas = idiomas;

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['idiomas']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'regalo_recibir') {
        let request: any = {};
        request.step = slide;
        request.regalo_recibir = this.regalo_recibir;

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['regalo_recibir']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'extras') {
        let request: any = this.extras_form.value;
        request.step = slide;

        this.extras.forEach ((e: any) => {
          if (e.id === 1) {
            request ['extra_' + e.id] = this.extras_form.value.relocate.id;
          } else {
            request ['extra_' + e.id] = this.extras_form.value.passport_ready.id;
          }
          
        });

        console.log (request);

        this.database.save_step_modal (request).subscribe ((res: any) => {
          console.log (res);
          loading.dismiss ();

          if (res.status) {
            this.slideNext ();
          } else {
            this.show_api_error (res, ['estoy_buscando']);
          }
        }, error => {
          loading.dismiss ();
          console.log (error);
        });
      } else if (slide === 'galeria') {
        loading.dismiss ();
        this.slideNext ();
      } else if (slide === 'gracias') {
        loading.dismiss ();
        this.modalController.dismiss (null, 'update');
      }
    }
  }

  get_valor_by_name (slide: string, array: any []) {
    let returned: any;

    array.forEach ((e: any) => {
      if (e.name === slide) {
        returned = e;
      }
    });

    return returned;
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

  ionViewDidEnter () {
    setTimeout (() => {
      this.ion_slides.lockSwipeToNext (true);
    }, 250);
  }

  slideNext () {
    this.ion_slides.lockSwipeToNext (false);
    this.ion_slides.slideNext ();

    setTimeout (() => {
      this.ion_slides.lockSwipeToNext (true);
    }, 400);
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

  radio_changed (event: any, value: string, map: Map <string, number>) {
    if (value === 'apariencia_') {
      map.set (value + event.detail.value.id_opcion_apariencia, event.detail.value.id);
    } else {
      map.set (value + event.detail.value.id_opcion_personalidad, event.detail.value.id);
    }

    console.log (map);
  }
  
  close () {
    this.modalController.dismiss (null, 'update');
  }

  back_step () {
    if (this.index > 0) {
      this.ion_slides.lockSwipeToNext (false);
      this.ion_slides.slidePrev ();

      setTimeout (() => {
        this.ion_slides.lockSwipeToNext (true);
      }, 400);
    } else {
      this.modalController.dismiss (null, 'update');
    }
  }

  skip_step () {
    this.ion_slides.lockSwipeToNext (false);
    this.ion_slides.slideNext ();

    setTimeout (() => {
      this.ion_slides.lockSwipeToNext (true);
    }, 400);
  }

  is_string (item: any) {
    return typeof item === 'string'
  }

  get_alturas () {
    let returned: any [] = [];

    this.alturas.forEach ((e: any) => {
      if (this.personal_data_form.value.sistema === 'metric') {
        returned.push ({
          id: e.metros,
          text: e.metros
        });
      } else {
        if (e.pies_pulgadas.indexOf ('.') <= -1) {
          returned.push ({
            id: e.metros,
            text: e.pies_pulgadas
          });
        }
      }
    });

    return returned;
  }

  sistema_changed () {
    this.personal_data_form.controls ['altura'].setValue ('');
  }

  get_altura_placeholder () {
    if (this.personal_data_form.value.sistema === 'metric') {
      return '1.60m'
    }

    return "5'";
  }

  async select_altura () {
    const modal = await this.modalController.create ({
      component: SelectorPage,
      componentProps: {
        items: this.alturas,
        type: 'altura'
      },
      swipeToClose: true,
      mode: 'ios'
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'response') {
      }
    });

    return await modal.present ();
  }
}
