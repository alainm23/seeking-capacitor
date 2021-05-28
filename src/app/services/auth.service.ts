import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

// Facebook
import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';

// Google
import { GoogleAuth } from '@reslear/capacitor-google-auth'


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
  private user_subject = new Subject<any> ();
  constructor (public http: HttpClient, private storage: Storage,
    private loadingController: LoadingController,
    private navController: NavController,
    private websocket: WebsocketService) {
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
      await GoogleAuth.signOut ();
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
    GoogleAuth.init ();
  }

  async google () {
    // const loading = await this.loadingController.create ({
    //   translucent: true,
    //   spinner: 'lines-small',
    //   mode: 'ios'
    // });

    // await loading.present ();
    
    GoogleAuth.signIn ().then ((result: any) => {
      alert (JSON.stringify (result));
    }, error => {
      alert (JSON.stringify (error));
    });
    

    // this.googlePlus.login ({}).then (async (request: any) => { 
    //   this.login_social (request.userId, 'Google', request.displayName, request.email).subscribe ((res: any) => {-
    //     loading.dismiss ();
    //     if (res.user.registro_incompleto == 1) {
    //       this.navController.navigateForward (['request-gps', res.user.id]);
    //     } else {
    //       this.save_local_user (res).then (() => {
    //         this.navController.navigateRoot ('home');
    //       });
    //     }
    //   }, error => {
    //     loading.dismiss ();
    //     alert (JSON.stringify (error));
    //   });
    // }, error => {
    //   loading.dismiss ();
    //   alert (JSON.stringify (error));
    // });
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
    this.get_user (access_token).subscribe (async (res: any) => {
      console.log (res);

      if (res.estado_cuenta > 0) {
        this.navController.navigateRoot (['block-page', JSON.stringify (res)]);
        this.storage.clear ();
        this.logout_social ();
      } else {
        console.log (res);
        this.USER_DATA = res;
        return await this.storage.set ('USER_DATA', JSON.stringify (this.USER_DATA));
      }
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
    alert ('current_accesstoken: ' + JSON.stringify (current_accesstoken));

    if (current_accesstoken.accessToken) {
      await FacebookLogin.logout ();
    }

    const FACEBOOK_PERMISSIONS = ['public_profile'];
    const result: FacebookLoginResponse = await FacebookLogin.login ({ permissions: FACEBOOK_PERMISSIONS });

    if (result.accessToken && result.accessToken.userId) {
      alert (result.accessToken.token);
      this.get_facebook_profile (result.accessToken.token, result.accessToken.userId);
    } else {
      alert ('Facebook Error');
    }
  }

  async get_facebook_profile (token: string, userId: string) {-    
    this.http.get (`https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${token}`).subscribe (async (request: any) => {
      alert (JSON.stringify (request));
      const loading = await this.loadingController.create ({
        translucent: true,
        spinner: 'lines-small',
        mode: 'ios'
      });

      await loading.present ();

      this.login_social (request.id, 'Facebook', request.name, '').subscribe ((res: any) => {
        alert (JSON.stringify (res));

        loading.dismiss ();

        if (res.user.estado_cuenta > 0) {
          this.navController.navigateRoot (['block-page', JSON.stringify (res.user)]);
        } else {
          if (res.user.registro_incompleto == 1) {
            this.navController.navigateForward (['request-gps', res.user.id]);
          } else {
            this.save_local_user (res).then (() => {
              this.navController.navigateRoot ('home');
            });
          }
        }
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
}
