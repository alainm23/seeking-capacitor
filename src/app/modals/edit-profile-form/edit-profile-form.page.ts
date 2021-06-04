import { Component, OnInit, Input } from '@angular/core';

// Form
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.page.html',
  styleUrls: ['./edit-profile-form.page.scss'],
})
export class EditProfileFormPage implements OnInit {
  @Input () form: any;

  personal_form: FormGroup;
  estoy_buscando_form: FormGroup;
  sobre_mi_form: FormGroup;

  generos: any [] = [];
  alturas: any [] = [];
  intereses: any [] = [];
  idiomas: any [] = [];
  personalidades: any [] = [];
  apariencias: any [] = [];
  generos_interes: any [] = [];
  relaciones: any [] = [];

  intereses_map: Map <string, boolean> = new Map <string, boolean> ();
  idiomas_map: Map <string, boolean> = new Map <string, boolean> ();
  personalidades_map: Map <string, boolean> = new Map <string, boolean> ();
  apariencias_map: Map <string, boolean> = new Map <string, boolean> ();
  generos_interes_map: Map <string, boolean> = new Map <string, boolean> ();
  relaciones_map: Map <string, boolean> = new Map <string, boolean> ();

  constructor (private auth: AuthService, private database: DatabaseService,
    private storage: Storage, private loadingController: LoadingController,
    private modalController: ModalController) {}

  ngOnInit () {
    this.personal_form = new FormGroup ({
      usernick: new FormControl ('', [Validators.required]),
      fecha_nacimiento: new FormControl ('', [Validators.required]),
      sexo:  new FormControl ({value: '', disabled: true}, [Validators.required]),
      ingreso_anual: new FormControl ('', [Validators.required]),
      patrimonio: new FormControl ('', [Validators.required]),
      sistema: new FormControl ('metric', [Validators.required]),
      altura: new FormControl ('', [Validators.required])
    });

    this.estoy_buscando_form = new FormGroup ({
      estoy_buscando: new FormControl ('', [Validators.required]),
    });

    this.sobre_mi_form = new FormGroup ({
      sobre_mi: new FormControl ('', [Validators.required]),
    });

    this.storage.get ('lang').then (async (lang: any) => {
      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });
  
      await loading.present ();

      if (this.form === 'personal_data') {
        this.auth.get_fields (['usernick', 'fecha_nacimiento', 'ingreso_anual', 'patrimonio', 'altura', 'sexo']).subscribe ((res: any) => {
          loading.dismiss ();
          
          console.log (res);

          this.personal_form.controls ['usernick'].setValue (res.usernick);
          this.personal_form.controls ['fecha_nacimiento'].setValue (res.fecha_nacimiento);
          this.personal_form.controls ['sexo'].setValue (parseInt (res.sexo));
          this.personal_form.controls ['ingreso_anual'].setValue (res.ingreso_anual);
          this.personal_form.controls ['patrimonio'].setValue (res.patrimonio);
          this.personal_form.controls ['altura'].setValue (res.altura);
        });

        this.database.get_datos ('generos', lang).subscribe ((res: any) => {
          console.log (res);
          this.generos = res;
        }, error => {
          console.log (error);
        });

        this.database.get_datos ('alturas', lang).subscribe ((res: any) => {
          console.log (res);
          this.alturas = res;
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'estoy_buscando') {
        this.auth.get_fields (['estoy_buscando']).subscribe ((res: any) => {
          loading.dismiss ();
          
          console.log (res);

          this.estoy_buscando_form.controls ['estoy_buscando'].setValue (res.estoy_buscando);
        });
      } else if (this.form === 'sobre_mi') {
        this.auth.get_fields (['acerca_de_mi']).subscribe ((res: any) => {
          loading.dismiss ();
          
          console.log (res);

          this.sobre_mi_form.controls ['sobre_mi'].setValue (res.sobre_mi);
        });
      } else if (this.form === 'intereses') {
        this.database.get_datos ('intereses', lang).subscribe ((res: any) => {
          console.log (res);
          this.intereses = res;

          this.auth.get_fields (['intereses']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.intereses.forEach ((element: any) => {
              this.intereses_map.set (element.id, true);
            });
          });
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'idiomas') {
        this.database.get_datos ('idiomas', lang).subscribe ((res: any) => {
          console.log (res);
          this.idiomas = res;

          this.auth.get_fields (['idiomas']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.idiomas.forEach ((element: any) => {
              this.idiomas_map.set (element.id, element);
            });
          });
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'personalidades') {
        this.database.get_datos ('personalidades', lang).subscribe ((res: any) => {
          console.log (res);
          this.personalidades = res;

          this.auth.get_fields (['personalidades']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.personalidades.forEach ((element: any) => {
              this.personalidades_map.set (element.id_opcion_personalidad, element);
            });
          });
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'apariencias') {
        this.database.get_datos ('apariencias', lang).subscribe ((res: any) => {
          console.log (res);
          this.apariencias = res;

          this.auth.get_fields (['apariencias']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.apariencias.forEach ((element: any) => {
              this.apariencias_map.set (element.id_opcion_apariencia, element);
            });
          });
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'generos_interes') {
        this.database.get_datos ('generos', lang).subscribe ((res: any) => {
          console.log (res);
          this.generos_interes = res;

          this.auth.get_fields (['generos_interes']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.generos_interes.forEach ((element: any) => {
              this.generos_interes_map.set (element.id, element);
            });
          });
        }, error => {
          console.log (error);
        });
      } else if (this.form === 'relaciones') {
        this.database.get_datos ('relaciones', lang).subscribe ((res: any) => {
          console.log (res);
          this.relaciones = res;

          this.auth.get_fields (['relaciones']).subscribe ((res: any) => {
            loading.dismiss ();
            console.log (res);

            res.relaciones.forEach ((element: any) => {
              this.relaciones_map.set (element.id, element);
            });
          });
        }, error => {
          console.log (error);
        });
      }
    });
  }

  check_disabled () {
    let returned: boolean = true;

    if (this.form === 'personal_data') {
      returned = this.personal_form.invalid;
    } else if (this.form === 'estoy_buscando') {
      returned = this.estoy_buscando_form.invalid;
    } else if (this.form === 'sobre_mi') {
      returned = this.sobre_mi_form.invalid;
    } else if (this.form === 'intereses') {
      returned = this.intereses_map.size <= 0;
    } else if (this.form === 'idiomas') {
      returned = this.idiomas_map.size <= 0;
    } else if (this.form === 'personalidades') {
      returned = this.personalidades_map.size <= 0;
    } else if (this.form === 'apariencias') {
      returned = this.apariencias_map.size <= 0;
    } else if (this.form === 'generos_interes') {
      returned = this.generos_interes_map.size <= 0;
    } else if (this.form === 'relaciones') {
      returned = this.relaciones_map.size <= 0;
    }

    return returned;
  }

  get_alturas () {
    let returned: any [] = [];

    this.alturas.forEach ((e: any) => {
      if (this.personal_form.value.sistema === 'metric') {
        returned.push ({
          id: e.metros,
          text: e.metros
        });
      } else {
        returned.push ({
          id: e.metros,
          text: e.pies_pulgadas
        });
        returned.push ();
      }
    });

    return returned;
  }

  async submit () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    let request: any = {};
    if (this.form === 'personal_data') {
      request = {
        seccion: "personal_data",
        usernick: this.personal_form.value.usernick,
        fecha_nacimiento: this.personal_form.value.fecha_nacimiento,
        ingreso_anual: this.personal_form.value.ingreso_anual,
        patrimonio: this.personal_form.value.patrimonio
      };

      if (this.personal_form.value.sistema === 'metric') {
        request.altura_metros  = this.personal_form.value.altura;
      } else {
        request.altura = this.personal_form.value.altura;
      }
    } else if (this.form === 'estoy_buscando') {
      request = {
        seccion: "estoy_buscando",
        estoy_buscando: this.estoy_buscando_form.value.estoy_buscando
      };
    } else if (this.form === 'sobre_mi') {
      request = {
        seccion: "sobre_mi",
        sobre_mi: this.sobre_mi_form.value.sobre_mi
      };
    } else if (this.form === 'intereses') {
      let intereses: number [] = [];
      this.intereses_map.forEach ((value: boolean, key: string) => {
        intereses.push (parseInt (key));
      });

      request = {
        seccion: "intereses",
        intereses: intereses
      };
    } else if (this.form === 'idiomas') {
      let idiomas: number [] = [];
      this.idiomas_map.forEach ((value: boolean, key: string) => {
        idiomas.push (parseInt (key));
      });

      request = {
        seccion: "idiomas",
        idiomas: idiomas
      };
    } else if (this.form === 'personalidades') {
      let personalidades: number [] = [];
      this.personalidades_map.forEach ((value: any, key: string) => {
        personalidades.push (parseInt (value.id));
      });

      request = {
        seccion: "personalidades",
        personalidades: personalidades
      };
    } else if (this.form === 'apariencias') {
      let apariencias: number [] = [];
      this.apariencias_map.forEach ((value: any, key: string) => {
        apariencias.push (parseInt (value.id));
      });

      request = {
        seccion: "apariencias",
        apariencias: apariencias
      };
    } else if (this.form === 'generos_interes') {
      let generos_interes: number [] = [];
      this.generos_interes_map.forEach ((value: boolean, key: any) => {
        generos_interes.push (parseInt (key));
      });

      request = {
        seccion: "generos_interes",
        generos_interes: generos_interes
      };
    } else if (this.form === 'relaciones') {
      let relaciones: number [] = [];
      this.relaciones_map.forEach ((value: boolean, key: any) => {
        relaciones.push (parseInt (key));
      });

      request = {
        seccion: "relaciones",
        relaciones: relaciones
      };
    }

    console.log (request);

    this.database.edit_profile (request).subscribe ((res: any) => {
      console.log (res);
      loading.dismiss ();
      this.modalController.dismiss (null, 'update');
    }, error => {
      console.log (error);
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

    console.log (map);
  }

  get_checked (id: string, map: Map <string, boolean>) {
    return map.has (id);
  }

  get_selected_text (id: string, map: Map <string, any>) {
    if (map.has (id)) {
      return map.get (id).valor;
    }

    return '';
  }

  back () {
    this.modalController.dismiss ();
  }

  select_changed (event: any, personalidad_id: string, map: Map <string, any>) {
    map.set (personalidad_id, event.detail.value);
    console.log (map);
  }
}
