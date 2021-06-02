import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

// Facebook
import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';

// Google
import { GooglePlus } from '@ionic-native/google-plus';
import { TranslateService } from '@ngx-translate/core';

import { LoadingController, NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { WebsocketService }from '../services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  USER_ACCESS: any = {};
  USER_DATA: any = {
    foto_perfil: ''
  };
  URL: string;

  data: string [] = ['id', 'creditos', 'email', 'email_verified_at',
    'estado_cuenta', 'foto_perfil', 'membresia', 'metric_system',
    'name', 'nombre_ciudad', 'nombre_pais', 'idioma',
    'registro_incompleto'];
  private user_subject = new Subject<any> ();
  constructor (public http: HttpClient, private storage: Storage,
    private loadingController: LoadingController,
    private navController: NavController,
    private websocket: WebsocketService,
    private translate: TranslateService) {
    this.URL = 'https://seekingterms.com/api/auth/';
  }

  usuario_changed (data: any) {
    this.user_subject.next (data);
  }

  get_user_observable (): Subject<any> {
    return this.user_subject;
  }

  login (email: string, password: string) {
    let url = this.URL + 'login';
    return this.http.post (url, {email: email, password: password});
  }

  logout () {
    let url = this.URL + 'logout';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.get (url, { headers });
  }

  resend_verification () {
    let url = 'https://seekingterms.com/api/auth/send/mail/verification';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.get (url, { headers })
  }

  async logout_social () {
    if (Capacitor.isNativePlatform ()) {
      // await GoogleAuth.signOut ();
      await FacebookLogin.logout ();
    }
  }

  validar_campo (request: any) {
    let url = this.URL + 'validar/campo/usuario';
    return this.http.post (url, request);
  }

  save_settings_all (request: any) {
    let url = 'https://seekingterms.com/api/users/user/settings/set/all';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.post (url, request, { headers });
  }

  save_settings (request: any) {
    let url = 'https://seekingterms.com/api/users/user/settings/set';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.post (url, request, { headers });
  }

  registro (request: any) {
    let url = this.URL + 'registro';

    let galeria: any [] = [];
    request.galeria.forEach ((file: any) => {
      if (file !== null) {
        galeria.push (file);
      }
    });

    const formData: FormData = new FormData ();
    formData.append ('usernick', request.usernick);
    formData.append ('sexo', request.sexo);

    if (request.id === 0) {
      formData.append ('email', request.email);
      formData.append ('password', request.password);
    } else {
      formData.append ('id', request.id);
      formData.append ('social', request.social);
    }

    formData.append ('ciudad', request.ciudad);
    formData.append ('pais', request.pais);
    formData.append ('pais_codigo', request.pais_codigo);
    formData.append ('latitud', request.latitud);
    formData.append ('longitud', request.longitud);
    formData.append ('year', request.year);
    formData.append ('month', request.month);
    formData.append ('day', request.day);
    formData.append ('imagen', request.imagen.file, request.imagen.name);

    for (let i = 0; i < request.referencias.length; i++) {
      formData.append ('referencias[]', request.referencias [i]);
    }

    for (let i = 0; i < request.relaciones.length; i++) {
      formData.append ('relaciones[]', request.relaciones [i]);
    }

    for (let i = 0; i < request.generos_interes.length; i++) {
      formData.append ('generos_interes[]', request.generos_interes [i]);
    }

    for (let i = 0; i < galeria.length; i++) {
      formData.append ('galeria[]', galeria [i].file, galeria [i].name);
    }

    formData.forEach ((value: any, key: any) => {
      console.log ('Key: ', key);
      console.log ('Value: ', value);
      console.log ('-----------------------')
    });

    return this.http.post (url, formData);
  }

  async save_local_user (request: any) {
    this.USER_ACCESS = {
      access_token: request.access_token,
      expires_at: request.expires_at
    };

    this.USER_DATA = request.user;
    
    this.translate.setDefaultLang (request.user.idioma.code);
    await this.storage.set ('lang', request.user.idioma.code);

    await this.storage.set ('USER_ACCESS', JSON.stringify (this.USER_ACCESS));
    this.websocket.init_websocket (this.USER_DATA.id, this.USER_ACCESS.access_token);
    return await this.storage.set ('USER_DATA', JSON.stringify (this.USER_DATA));
  }

  async request_notification (request: any) {
    this.USER_ACCESS = {
      access_token: request.access_token,
      expires_at: request.expires_at
    };

    this.USER_DATA = request.user;

    this.usuario_changed ({USER_ACCESS: this.USER_ACCESS, USER_DATA: this.USER_DATA});
  }

  save_notification (USER_ACCESS: any, USER_DATA: any) {
    this.usuario_changed ({USER_ACCESS: USER_ACCESS, USER_DATA: USER_DATA});
  }

  get_settings () {
    let url = 'https://seekingterms.com/api/users/user/settings/get';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.get (url, { headers });
  }

  google_init () {
    // GoogleAuth.init ();
  }

  async google () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    GooglePlus.login ({}).then (async (request: any) => { 
      this.login_social (request.userId, 'Google', request.displayName, request.email).subscribe ((res: any) => {
        let request: any = res;
        this.get_fields_access_token (request.access_token, this.data).subscribe (async (user: any) => {
          request.user = user;
          console.log (request);

          if (request.user.estado_cuenta > 0) {
            this.navController.navigateRoot (['block-page', JSON.stringify (request.user)]).then (() => {
              loading.dismiss ();
            });
          } else {
            if (request.user.registro_incompleto == 1) {
              loading.dismiss ();
              this.navController.navigateForward (['request-gps', request.user.id]);
            } else {
              this.save_local_user (request).then (() => {
                loading.dismiss ();
                this.navController.navigateRoot ('home');
              });
            }
          }
        }, error => {
          console.log (error);
        });
      }, error => {
        loading.dismiss ();
        alert (JSON.stringify (error));
      });
    }, error => {
      loading.dismiss ();
      alert (JSON.stringify (error));
    });
  }

  get_user (access_token: string='') {
    if (access_token === '') {
      access_token = this.USER_ACCESS.access_token;
    }

    let url = 'https://seekingterms.com/api/auth/user';

    const headers = {
      'Authorization': 'Bearer ' + access_token
    }

    return this.http.get (url, { headers });
  }

  update_user_data (access_token: string) {
    let data: string [] = ['id', 'creditos', 'email', 'email_verified_at',
    'estado_cuenta', 'foto_perfil', 'membresia', 'metric_system',
    'name', 'nombre_ciudad', 'nombre_pais', 'idioma',
    'registro_incompleto', 'galeria'];

    this.get_fields_access_token (access_token, data).subscribe (async (user: any) => {
      console.log (user);

      if (user.estado_cuenta > 0) {
        this.navController.navigateRoot (['block-page', JSON.stringify (user)]);
        this.storage.clear ();
        this.logout_social ();
      } else {
        console.log (user);
        this.USER_DATA = user;
        return await this.storage.set ('USER_DATA', JSON.stringify (this.USER_DATA));
      }
    });
  }

  update_user () {
    let data: string [] = ['id', 'creditos', 'email', 'email_verified_at',
    'estado_cuenta', 'foto_perfil', 'membresia', 'metric_system',
    'name', 'nombre_ciudad', 'nombre_pais', 'idioma',
    'registro_incompleto', 'galeria'];

    this.get_fields (data).subscribe (async (user: any) => {
      console.log (user);
      this.USER_DATA = user;
      await this.storage.set ('USER_DATA', JSON.stringify (this.USER_DATA));
    });
  }

  borrar_user_access () {
    this.storage.clear ().then (() => {
      this.navController.navigateRoot ('login');
    });
  }

  delete_account () {
    let url = 'https://seekingterms.com/api/auth/delete/account';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.get (url, { headers });
  }

  async facebook () {
    const current_accesstoken = await FacebookLogin.getCurrentAccessToken ();
    
    if (current_accesstoken.accessToken) {
      await FacebookLogin.logout ();
    }

    const FACEBOOK_PERMISSIONS = ['public_profile'];
    const result: FacebookLoginResponse = await FacebookLogin.login ({ permissions: FACEBOOK_PERMISSIONS });

    if (result.accessToken && result.accessToken.userId) {
      this.get_facebook_profile (result.accessToken.token, result.accessToken.userId);
    } else {
    }
  }

  async get_facebook_profile (token: string, userId: string) {-    
    this.http.get (`https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${token}`).subscribe (async (request: any) => {
      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });

      await loading.present ();

      this.login_social (request.id, 'Facebook', request.name, '').subscribe ((res: any) => {
        let request: any = res;
        this.get_fields_access_token (request.access_token, this.data).subscribe (async (user: any) => {
          request.user = user;
          console.log (request);

          if (request.user.estado_cuenta > 0) {
            this.navController.navigateRoot (['block-page', JSON.stringify (request.user)]).then (() => {
              loading.dismiss ();
            });
          } else {
            if (request.user.registro_incompleto == 1) {
              loading.dismiss ();
              this.navController.navigateForward (['request-gps', request.user.id]);
            } else {
              this.save_local_user (request).then (() => {
                loading.dismiss ();
                this.navController.navigateRoot ('home');
              });
            }
          }
        }, error => {
          console.log (error);
        });
      }, error => {
        loading.dismiss ();
        alert (JSON.stringify (error));
      });
    });
  }

  login_social (provider_id: string, tipo: string, name: string, email: string) {
    let request: any = {
      provider_id: provider_id,
      tipo: tipo,
      name: name,
      email: email
    };

    return this.http.post ('https://seekingterms.com/api/auth/login/social', request);
  }
  
  get_fields (fields: any []) {
    let url = 'https://seekingterms.com/api/auth/get/specifics/fields/user';

    const headers = {
      'Authorization': 'Bearer ' + this.USER_ACCESS.access_token
    }

    return this.http.post (url, {fields: fields}, { headers });
  }

  get_fields_access_token (access_token: string, fields: any []) {
    let url = 'https://seekingterms.com/api/auth/get/specifics/fields/user';

    const headers = {
      'Authorization': 'Bearer ' + access_token
    }

    return this.http.post (url, {fields: fields}, { headers });
  }
}
