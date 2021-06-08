import { Component, OnInit } from '@angular/core';

import { LoadingController, NavController, ToastController, Platform } from '@ionic/angular';
import { Capacitor } from "@capacitor/core";
import { ActivatedRoute } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { UtilsService } from '../../services/utils.service';

// Geo
import { Geolocation } from '@capacitor/geolocation';
declare var google: any;

@Component({
  selector: 'app-request-gps',
  templateUrl: './request-gps.page.html',
  styleUrls: ['./request-gps.page.scss'],
})
export class RequestGpsPage implements OnInit {
  location: any;
  error_message: any;
  id: any;

  constructor (private route: ActivatedRoute,
    private locationService: LocationService,
    private loadingController: LoadingController,
    private navController: NavController,
    private toastController: ToastController,
    private utils: UtilsService) { }

  ngOnInit () {
    this.id = this.route.snapshot.paramMap.get ('id');
    console.log (this.id);
  }

  async check_gps () {
    if (!Capacitor.isNativePlatform ()) {
      return this.postGPSPermission (true);
    }

    const hasPermission = await this.locationService.checkGPSPermission ();
    if (hasPermission) {
      const canUseGPS = await this.locationService.askToTurnOnGPS ();
      this.postGPSPermission (canUseGPS);
    } else {
      const permission = await this.locationService.requestGPSPermission ();
      if (permission === 'CAN_REQUEST' || permission === 'GOT_PERMISSION') {
        const canUseGPS = await this.locationService.askToTurnOnGPS ();
        this.postGPSPermission (canUseGPS);
      } else {
        // this.presentToast (
        //   this.utils.get_translate ('User denied location permission'),
        //   'warning'
        // );
      }
    }
  }

  async postGPSPermission (canUseGPS: boolean) {
    if (canUseGPS) {
      this.getPosition ();
    } else {
      this.presentToast (
        this.utils.get_translate ('Please turn on GPS to get location'),
        'warning'
      );
    }
  }

  async getPosition () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    const coordinates: any = await Geolocation.getCurrentPosition ({
      timeout: 30 * 1000
    });

    console.log (coordinates);

    if (coordinates.coords) {
      let geocoder: any = new google.maps.Geocoder ();

      let location = new google.maps.LatLng (
        coordinates.coords.latitude,
        coordinates.coords.longitude
      );

      geocoder.geocode ({'location': location}, (results: any, status: any) => {
        console.log (results);
        loading.dismiss ();

        if (status == 'OK') {
          this.get_location (results [0], coordinates.coords.latitude, coordinates.coords.longitude);
        } else {
          
        }
      });
    } else {
      loading.dismiss ();
      this.presentToast (
        this.utils.get_translate ('No pudimos obtener tu ubicación, porfavor asegúrate de tener prendido el GPS de tu dispositivo o inténtalo más tarde.'),
        'danger'
      );
    }
  }

  get_location (result: any, latitude: number, longitude: number) {
    let pais: string = '';
    let pais_code: string = '';
    let ciudad: string = '';
    let referencias: string [] = [];

    result.address_components.forEach ((element: any) => {
      if (element.types.indexOf ("country") > -1) {
        pais = element.long_name;
        pais_code = element.short_name;
      }

      if (element.types.indexOf ("locality") > -1) {
        ciudad = element.long_name;
      }

      if (element.types.indexOf ("administrative_area_level_1") > -1) {
        referencias.push (element.long_name);
      }

      if (element.types.indexOf ("administrative_area_level_2") > -1) {
        referencias.push (element.long_name);
      }
    });
    
    this.location = {
      ciudad: ciudad,
      pais: pais,
      pais_code: pais_code,
      referencias: referencias,
      latitud: latitude,
      longitud: longitude
    };

    console.log (this.location);

    this.navController.navigateForward (['registro', this.id, JSON.stringify (this.location)]);
  }

  back_step () {
    this.navController.back ();
  }

  later () {
    this.location = {
      ciudad: '',
      pais: '',
      pais_code: '',
      referencias: [],
      latitud: 0,
      longitud: 0
    };

    console.log (this.location);
    this.navController.navigateForward (['registro', this.id, JSON.stringify (this.location)]);
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 1000,
      position: 'top'
    });

    toast.present ();
  }
}
