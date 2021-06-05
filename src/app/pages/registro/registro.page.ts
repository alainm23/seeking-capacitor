import { Component, OnInit, ViewChild } from '@angular/core';

// Services
import { IonSlides, Platform, ToastController, LoadingController, IonInput, ModalController, ActionSheetController, NavController } from '@ionic/angular'; 
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import * as moment from 'moment';
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '../../services/utils.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

// Modals
import { SelectPlanPage } from '../../modals/select-plan/select-plan.page';
import { BuySingleCreditsPage } from '../../modals/buy-single-credits/buy-single-credits.page';
import { PaymentPage } from '../../modals/payment/payment.page';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  @ViewChild (IonSlides, { static: false }) slides: IonSlides;
  @ViewChild ("year_input", { static: false }) year_input: IonInput;
  @ViewChild ("month_input", { static: false }) month_input: IonInput;
  @ViewChild ("day_input", { static: false }) day_input: IonInput;

  index: number = 0;
  length: number = 9;
  id: string;
  location: any;
  date_input_focus: string = 'day';

  form_usernick: FormGroup;
  form_birthday: FormGroup;
  form_sexo: FormGroup;
  form_email: FormGroup;
  form_password: FormGroup;
  form_location: FormGroup;
  form_terms: FormGroup;

  slideOpts = {
    initialSlide: 8,
    duration: 400,
    slidesPerView: 1
  };

  inputs: Map <string, IonInput> = new Map <string, IonInput> ();
  generos_map: Map <string, boolean> = new Map <string, boolean> ();
  relaciones_map: Map <string, boolean> = new Map <string, boolean> ();
  generos: any [] = [];
  relaciones: any [] = [];
  regions: any [] = [];
  cities: any [] = [];

  profile_image: any = '';

  profile_file: any = {};
  photos: string [] = ['', '', '', '', ''];
  photos_file: any = [null, null, null, null, null];
  lang: string;
  countries_black_list: string [] = ['AF', 'AL', 'AO', 'BD', 'BA', 'BY',
    'BI', 'CF', 'CU', 'CD', 'EG', 'ER',
    'ET', 'GQ', 'GN', 'GW', 'IR', 'IQ',
    'RS', 'LB', 'LY', 'MK', 'ML', 'MD',
    'ME', 'MM', 'NI', 'RU', 'VC', 'RS',
    'SO', 'SS', 'LK', 'TN', 'UA', 'VU',
    'VE', 'YE', 'ZW'];
  constructor (private toastController: ToastController,
    private auth: AuthService,
    private loadingController: LoadingController,
    private database: DatabaseService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private route: ActivatedRoute,
    private navController: NavController,
    private storage: Storage,
    private utils: UtilsService) { }

  async ngOnInit () {
    this.id = this.route.snapshot.paramMap.get ('id');
    this.location = JSON.parse (this.route.snapshot.paramMap.get ('location'));
    console.log (this.location);
    
    if (this.id !== 'null') {
      this.length = 7;
    }

    this.form_usernick = new FormGroup ({
      usernick: new FormControl ('', [Validators.required])
    });

    this.form_birthday = new FormGroup ({
      day: new FormControl ('', [Validators.required]),
      month: new FormControl ('', [Validators.required]),
      year: new FormControl ('', [Validators.required])
    });

    this.form_sexo = new FormGroup ({
      sexo: new FormControl ('', [Validators.required])
    });

    const email = new FormControl ('', [Validators.required, Validators.email]);
    const confirm_email = new FormControl ('', [Validators.required, Validators.email, CustomValidators.equalTo (email)]);

    this.form_email = new FormGroup ({
      email: email,
      confirm_email: confirm_email
    });

    const password = new FormControl ('', Validators.required);
    const confirm_password = new FormControl ('', [Validators.required, CustomValidators.equalTo (password)]);

    this.form_password = new FormGroup ({
      password: password,
      confirm_password: confirm_password
    });

    this.form_location = new FormGroup ({
      ciudad: new FormControl ('', [Validators.required]),
      pais: new FormControl ('', [Validators.required]),
      pais_code: new FormControl ('', [Validators.required]),
      referencias: new FormControl ('', [Validators.required]),
      latitud: new FormControl ('', [Validators.required]),
      longitud: new FormControl ('', [Validators.required])
    });

    this.form_terms = new FormGroup ({
      terms: new FormControl (false, [Validators.required, Validators.pattern('true')])
    });

    this.form_location.controls ['ciudad'].setValue (this.location.ciudad);
    this.form_location.controls ['pais'].setValue (this.location.pais);
    this.form_location.controls ['pais_code'].setValue (this.location.pais_code);
    this.form_location.controls ['referencias'].setValue (this.location.referencias);
    this.form_location.controls ['latitud'].setValue (this.location.latitud);
    this.form_location.controls ['longitud'].setValue (this.location.longitud);

    this.storage.get ('lang').then (async (lang: any) => {
      this.lang = lang;
      this.get_datos (lang);
    });
  }

  get_datos (lang: string) {
    this.database.get_datos ('generos', lang).subscribe ((res: any) => {
      this.generos = res;
    }, error => {
      console.log (error);
    });

    this.database.get_datos ('relaciones', lang).subscribe ((res: any) => {
      console.log (res);
      this.relaciones = res;
    }, error => {
      console.log (error);
    });
  }

  ionViewDidEnter () {
    setTimeout (() => {
      this.slides.lockSwipeToNext (true);
      this.inputs.set ('year_input', this.year_input);
      this.inputs.set ('month_input', this.month_input);
      this.inputs.set ('day_input', this.day_input);
    }, 250);
  }

  slides_changed () {
    this.slides.getActiveIndex ().then ((index: number) => {
      this.index = index;
      console.log (this.index);
    });
  }

  valid_step () {
    let returned: boolean = false;

    if (this.id === 'null') {
      if (this.index === 0) { // Nick
        if (this.form_usernick.invalid) {
          this.presentToast (
            this.utils.get_translate ('Your nickname is required'), 'danger'
          );  
        } else {
          returned = true;
        }
      } else if (this.index === 1) { // Email
        if (this.form_email.invalid) {
          ['email', 'confirm_email'].forEach ((control: string) => {
            if (this.form_email.controls [control].errors !== null) {
              if (this.form_email.controls [control].errors.email === true) {
                this.presentToast (this.utils.get_translate ('Enter a valid email address'), 'danger');
              } else if (this.form_email.controls [control].errors.equalTo === true) {
                this.presentToast (this.utils.get_translate ('The confirm email and email must match'), 'danger');
              } else if (this.form_email.controls [control].errors.required === true) {
                this.presentToast (this.utils.get_translate ('Your email is required'), 'danger');
              }
            }
          });
        } else {
          returned = true;
        }
      } else if (this.index === 2) { // Password
        if (this.form_password.invalid) {
          ['password', 'confirm_password'].forEach ((control: string) => {
            if (this.form_password.controls [control].errors !== null) {
              if (this.form_password.controls [control].errors.equalTo === true) {
                this.presentToast (this.utils.get_translate ('The confirm password and password must match'), 'danger');
              } else if (this.form_password.controls [control].errors.required === true) {
                this.presentToast (this.utils.get_translate ('Your password is required'), 'danger');
              }
            }
          });
        } else {
          returned = true;
        }
      } else if (this.index === 3) { // Birdhday
        const fecha = moment (this.form_birthday.value.year + '-' + this.form_birthday.value.month + '-' + this.form_birthday.value.day);
        if (fecha.isValid ()) {
          console.log (parseInt (fecha.format ('YYYY')));

          if (parseInt (fecha.format ('YYYY')) < 1940) {
            this.presentToast (
              this.utils.get_translate ('Enter a valida date'),
              'danger'
            );
          } else {
            if (parseInt (moment ().format ('YYYY')) - parseInt (fecha.format ('YYYY')) < 18) {
              this.presentToast (this.utils.get_translate ('You must be over 18 years of age to continue'), 'danger');
            } else {
              returned = true;
            }
          }
        } else {
          this.presentToast (this.utils.get_translate ('The selected date is invalid'), 'danger');
        }
      } else if (this.index === 4) { // Sexo
        if (this.form_sexo.invalid) {
          this.presentToast (this.utils.get_translate ('Select one option'), 'danger');  
        } else {
          returned = true;
        }
      } else if (this.index === 5) { // Generos
        if (this.generos_map.size <= 0) {
          this.presentToast (this.utils.get_translate ('Select at least one option'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 6) {
        if (this.relaciones_map.size <= 0) {
          this.presentToast (this.utils.get_translate ('Select at least one option'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 7) {
        if (this.profile_image === '') {
          this.presentToast (this.utils.get_translate ('Your profile image is required'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 8) {
        returned = true;
      } else if (this.index === 9) {
        if (this.form_terms.invalid) {
          this.presentToast (this.utils.get_translate ('You need to accept the terms and conditions'), 'danger');  
        } else {
          returned = true;
        }
      }
    } else {
      if (this.index === 0) {
        if (this.form_usernick.invalid) {
          this.presentToast ('The given data was invalid.', 'danger');  
        } else {
          returned = true;
        }
      } else if (this.index === 1) {
        const fecha = moment (this.form_birthday.value.year + '-' + this.form_birthday.value.month + '-' + this.form_birthday.value.day);
        if (fecha.isValid ()) {
          console.log (parseInt (fecha.format ('YYYY')));

          if (parseInt (fecha.format ('YYYY')) < 1940) {
            this.presentToast (
              this.utils.get_translate ('Enter a valida date'),
              'danger'
            );
          } else {
            if (parseInt (moment ().format ('YYYY')) - parseInt (fecha.format ('YYYY')) < 18) {
              this.presentToast (this.utils.get_translate ('You must be over 18 years of age to continue'), 'danger');
            } else {
              returned = true;
            }
          }
        } else {
          this.presentToast (this.utils.get_translate ('The selected date is invalid'), 'danger');
        }
      } else if (this.index === 2) {
        if (this.form_sexo.invalid) {
          this.presentToast (this.utils.get_translate ('Select one option'), 'danger');  
        } else {
          returned = true;
        }
      } else if (this.index === 3) {
        if (this.generos_map.size <= 0) {
          this.presentToast (this.utils.get_translate ('Select at least one option'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 4) {
        if (this.relaciones_map.size <= 0) {
          this.presentToast (this.utils.get_translate ('Select at least one option'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 5) {
        if (this.profile_image === '') {
          this.presentToast (this.utils.get_translate ('Your profile image is required'), 'danger');
        } else {
          returned = true;
        }
      } else if (this.index === 6) {
        returned = true;
      } else if (this.index === 7) {
        if (this.form_terms.invalid) {
          this.presentToast (this.utils.get_translate ('You need to accept the terms and conditions'), 'danger');  
        } else {
          returned = true;
        }
      }
    }

    return returned;
  }

  async next_step () {
    if (this.valid_step ()) {
      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });
  
      await loading.present ();

      if (this.id === 'null') {
        if (this.index === 0) {
          let request: any = this.form_usernick.value;
          request.campo = 'usernick';
          request.lang = this.lang;
  
          this.auth.validar_campo (request).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);
  
            if (res.status) {
              this.slideNext ();
            } else {
              this.show_api_error (res, ['usernick']);
            }
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else if (this.index === 1) {
          let request: any = this.form_email.value;
          request.campo = 'email';
          request.lang = this.lang;
  
          this.auth.validar_campo (request).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);
  
            if (res.status) {
              this.slideNext ();
            } else {
              this.show_api_error (res, ['email', 'confirm_email']);
            }
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else if (this.index === 2) {
          let request: any = this.form_password.value;
          request.campo = 'password';
          request.lang = this.lang;
  
          this.auth.validar_campo (request).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);
  
            if (res.status) {
              this.slideNext ();
            } else {
              this.show_api_error (res, ['password']);
            }
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else if (this.index === 3 || this.index === 4 || this.index === 5 ||
            this.index === 6 || this.index === 7 || this.index === 8) {
          loading.dismiss ();
          this.slideNext ();
        } else if (this.index === 9) {
          let generos_interes: number [] = [];
          let relaciones: number [] = [];
  
          this.generos_map.forEach ((value: boolean, key: string) => {
            generos_interes.push (parseInt (key));
          });
  
          this.relaciones_map.forEach ((value: boolean, key: string) => {
            relaciones.push (parseInt (key));
          });

          let lenguaje: any = 1;
          if (this.lang === 'es') {
            lenguaje = 2;
          }
          
          let request: any = {};
          request.id = 0;
          request.usernick = this.form_usernick.value.usernick;
          request.lenguaje = lenguaje;
          request.sexo = this.form_sexo.value.sexo;
          request.relaciones = relaciones;
          request.generos_interes = generos_interes;
          request.email = this.form_email.value.email;
          request.password = this.form_password.value.password;
          request.year = this.form_birthday.value.year;
          request.month = this.form_birthday.value.month;
          request.day = this.form_birthday.value.day;
          request.imagen = this.profile_file;
          request.galeria = this.photos_file;

          // Geo Update
          request.ciudad = this.form_location.value.ciudad;
          request.pais = this.form_location.value.pais;
          request.pais_codigo = this.form_location.value.pais_code;
          request.referencias = this.form_location.value.referencias;
          request.latitud = this.form_location.value.latitud;
          request.longitud = this.form_location.value.longitud;

          console.log (request);
  
          this.auth.registro (request).subscribe ((res: any) => {
            console.log (res);
            if (res ['status'] === undefined) {
              this.select_plan (res, loading);
            } else {
              this.show_api_error (res, ['usernick', 'sexo', 'relaciones', 'generos_interes', 'email',
              'password', 'pais', 'id_region', 'id_ciudad', 'latitud', 'longitud', 'year', 'month', 
              'day', 'imagen', 'galeria']);
              loading.dismiss ();
            }
          }, error => {
            console.log (error);
            loading.dismiss ();
          });
        }
      } else {
        if (this.index === 0) {
          let request: any = this.form_usernick.value;
          request.campo = 'usernick';
          request.lang = this.lang;
  
          this.auth.validar_campo (request).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);
  
            if (res.status) {
              this.slideNext ();
            } else {
              this.show_api_error (res, ['usernick']);
            }
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else if (this.index === 1 ||this.index === 2 ||
            this.index === 3 || this.index === 4 || this.index === 5 ||
            this.index === 6) {
          loading.dismiss ();
          this.slideNext ();
        } else if (this.index === 7) {
          let generos_interes: number [] = [];
          let relaciones: number [] = [];
  
          this.generos_map.forEach ((value: boolean, key: string) => {
            generos_interes.push (parseInt (key));
          });
  
          this.relaciones_map.forEach ((value: boolean, key: string) => {
            relaciones.push (parseInt (key));
          });

          let lenguaje: any = 1;
          if (this.lang === 'es') {
            lenguaje = 2;
          }
          
          let request: any = {};
          request.id = 0;
          request.usernick = this.form_usernick.value.usernick;
          request.lenguaje = lenguaje;
          request.sexo = this.form_sexo.value.sexo;
          request.relaciones = relaciones;
          request.generos_interes = generos_interes;
          request.email = this.form_email.value.email;
          request.password = this.form_password.value.password;
          request.year = this.form_birthday.value.year;
          request.month = this.form_birthday.value.month;
          request.day = this.form_birthday.value.day;
          request.imagen = this.profile_file;
          request.galeria = this.photos_file;

          // Geo Update
          request.ciudad = this.form_location.value.ciudad;
          request.pais = this.form_location.value.pais;
          request.pais_codigo = this.form_location.value.pais_code;
          request.referencias = this.form_location.value.referencias;
          request.latitud = this.form_location.value.latitud;
          request.longitud = this.form_location.value.longitud;

          if (this.id !== 'null') {
            request.social = true;
            request.id = parseInt (this.id);
            delete request.email;
            delete request.password;
          }
  
          console.log (request);

          this.auth.registro (request).subscribe ((res: any) => {
            console.log (res);
            if (res ['status'] === undefined) {
              this.select_plan (res, loading);
            } else {
              loading.dismiss ();
              this.show_api_error (res, ['usernick', 'sexo', 'relaciones', 'generos_interes', 'email',
              'password', 'pais', 'id_region', 'id_ciudad', 'latitud', 'longitud', 'year', 'month', 
              'day', 'imagen', 'galeria']);
            }
          }, error => {
            console.log (error);
            loading.dismiss ();
          });
        }
      }
    }
  }

  async select_plan (res: any, loading: any) {
    this.auth.save_local_user (res).then (async () => {
      if (this.countries_black_list.indexOf (this.form_location.value.pais_codigo) > -1) {
        if (this.id === 'null') {
          await this.storage.set ('verify-email-sent', moment ().format ());
          loading.dismiss ();
          this.navController.navigateRoot ('verify-email');
        } else {
          loading.dismiss ();
          this.navController.navigateRoot ('request-notification');
        }
      } else {
        const modal = await this.modalController.create ({
          component: SelectPlanPage,
          componentProps: {
            page: 'registro'
          }
        });
    
        modal.onWillDismiss ().then (async (response: any) => {
          if (response.role === 'free') {
            if (this.id === 'null') {
              await this.storage.set ('verify-email-sent', moment ().format ());
              this.navController.navigateRoot ('verify-email');
            } else {
              this.navController.navigateRoot ('request-notification');
            }
          } else if (response.role === 'free-spirit') {
            this.open_buy_credis ();
          } else if (response.role === 'subscription') {
            this.open_payment (response.data, 'subscription');
          }
        });
        
        return await modal.present ().then (() => {
          loading.dismiss ();
        });
      }
    });
  }

  async open_buy_credis () {
    const modal = await this.modalController.create ({
      component: BuySingleCreditsPage
    });

    modal.onWillDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.open_payment (response.data, 'credis');
      }
    });
    
    return await modal.present ();
  }

  async open_payment (data: any, type: string) {
    const modal = await this.modalController.create ({
      component: PaymentPage,
      componentProps: {
        data: data,
        type: type
      }
    });

    modal.onWillDismiss ().then (async (response: any) => {
      if (response.role === 'PAID') {
        const loading = await this.loadingController.create ({
          translucent: true,
          spinner: 'lines-small',
          mode: 'ios'
        });
    
        await loading.present ();

        if (response.data.type === 'credis') {
          let request: any = {
            creditos: response.data.data.creditos,
            codigo_transaccion: response.data.response.id,
            total_pagado: response.data.data.value
          };
  
          console.log (request);
  
          this.database.guardar_pago_creditos (request).subscribe (async (res: any) => {
            if (res.status === true) {
              this.auth.USER_DATA.creditos += request.creditos;
              this.storage.set ('USER_DATA', JSON.stringify (this.auth.USER_DATA)).then (() => {
                loading.dismiss ();
                this.navController.navigateRoot (['purchase-message', this.id]);
              });
            } 
          }, error => {
            loading.dismiss ();
            console.log (error);
          });
        } else {
          let request: any = {
            id_plan: response.data.data.id,
            id_suscripcion: response.data.response.subscriptionID,
            codigo_transaccion: response.data.response.orderID
          };

          this.database.guardar_membresia (request).subscribe ((res: any) => {
            console.log (res);
            loading.dismiss ();
            this.navController.navigateRoot (['purchase-message', this.id]);
          }, error => {
            console.log (error);
            loading.dismiss ();
          });
          console.log (response);
        }
      }
    });
    
    return await modal.present ();
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

  slideNext () {
    this.slides.lockSwipeToNext (false);
    this.slides.slideNext ();

    setTimeout (() => {
      this.slides.lockSwipeToNext (true);
    }, 400);
  }

  back_step () {
    if (this.index > 0) {
      this.slides.lockSwipeToNext (false);
      this.slides.slidePrev ();

      setTimeout (() => {
        this.slides.lockSwipeToNext (true);
      }, 400);
    } else {
      this.navController.back ();
    }
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

  set_input_focus (input: string) {
    this.inputs.get (input).setFocus ();
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

  get_profile_image () {
    return this.profile_image;
  }

  get_photos_index (index: number) {
    return this.photos [index];
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

    console.log (file);
    this.valid_image (file, type, index);
  }

  async valid_image (file: any, type: string, index: number) {
    const formData: FormData = new FormData ();
    formData.append ('campo', 'imagen');
    formData.append ('lang', this.lang);
    formData.append ('imagen', file.blob, file.name);

    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.valid_photo (formData).subscribe ((res: any) => {
      if (res.status) {
        this.show_image (file, type, index);
      } else {
        this.presentToast (res.message, 'danger');
      }

      loading.dismiss ();
    }, error => {
      console.log (error);
      loading.dismiss ();
      this.show_api_error (error.error, ['imagen']);
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
  
  show_image (file: any, type: string, index: number=0) {
    if (type === 'profile') {
      this.profile_file = {
        file: file.blob,
        name: file.name
      };
      this.profile_image = file.webPath;
    } else {
      this.photos [index] = file.webPath;
      this.photos_file [index] = {
        file: file.blob,
        name: file.name
      };
    }
  }

  async changeListener (event: any) {
    if (event.target.files.length > 0) {
      let file = event.target.files [0];

      const formData: FormData = new FormData ();
      formData.append ('campo', 'imagen');
      formData.append ('lang', this.lang);
      formData.append ('imagen', file, file.name);

      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });
  
      await loading.present ();

      this.database.valid_photo (formData).subscribe ((res: any) => {
        console.log (res);

        if (res.status) {
          this.profile_file = {
            file: file,
            name: file.name
          };
          this.getBase64 (file);
        } else {
          this.presentToast (res.message, 'danger');
        }
  
        loading.dismiss ();
      }, error => {
        loading.dismiss ();
        this.show_api_error (error.error, ['imagen']);
      });
    }
  }

  getBase64 (file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL (file);
    
    reader.onload = () => {
      console.log (reader.result);
      this.profile_image = reader.result;
    };
    
    reader.onerror = (error) => {
      console.log (error);
    };
  }

  change_month (event: any, type: string) {
    let value: string = event.detail.value;
    if (type === 'day') {
      if (value.length >= 2) {
        this.inputs.get ('month_input').setFocus ();
      }
    } else if (type === 'month') {
      if (value.length >= 2 && parseInt (value) > 0 && parseInt (value) <= 12) {
        this.inputs.get ('year_input').setFocus ();
      }
    }
  }

  change_focus (event: any) {
    this.date_input_focus = event;
    console.log (this.date_input_focus);
  }

  delete_image (index: number) {
    if (index === -1) {
      this.profile_image = '';
      this.profile_file = null;
    } else {
      this.photos [index] = '';
      this.photos_file [index] = null;
    }
  }
}
