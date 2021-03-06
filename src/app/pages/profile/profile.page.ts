import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ChatPage } from '../../modals/chat/chat.page';
import { UtilsService } from 'src/app/services/utils.service';
declare var google: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any = null;

  id: string;
  profile: any = {};
  galeria: any [] = [];

  slideOpts = {
    autoplay: true,
    initialSlide: 0,
    speed: 400,
    pagination: {
      el: '.swiper-pagination',
      dynamicBullets: true,
    },
  };

  loadings: any = {
    wink: false,
    favorite: false
  };

  constructor (private database: DatabaseService,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private navController: NavController,
    private toastController: ToastController,
    private modalController: ModalController,
    private utils: UtilsService) { }

  async ngOnInit () {
    this.id = this.route.snapshot.paramMap.get ('id');
    this.get_profile ();
  }

  async get_profile () {
    const loading = await this.loadingController.create ({
      translucent: true,
      spinner: 'lines-small',
      mode: 'ios'
    });

    await loading.present ();

    this.database.get_profile_data (this.id).subscribe ((res: any) => {
      console.log (res);

      this.galeria.push ({
        imagen: res.foto_perfil
      });
      this.galeria = this.galeria.concat (res.galeria);
      this.profile = res;

      this.init_map (res.latitud, res.longitud);
      loading.dismiss ();
    }, error => {
      console.log (error);
      loading.dismiss ();
    });
  }

  send_wink () {
    this.loadings.wink = true
    this.database.send_wink (this.id).subscribe ((res: any) => {
      this.loadings.wink = false;
      console.log (res);
      if (res.status === true) {
        this.presentToast (this.utils.get_translate ('Wink sent'), 'success');
        this.profile.winked = true;
        this.profile.id_chat = res.id_chat;
      } else if (res.status === false) {
        this.presentToast (this.utils.get_translate ('Wink has already been sent'), 'danger');
      } else if (res.status === null) {
        this.presentToast (this.utils.get_translate ('You can only send 5 winks per day'), 'danger');
      }
    }, error => {
      this.loadings.wink = false;
      console.log (error);
    });
  }

  init_map (latitude: number, longitude: number) {
    let point = new google.maps.LatLng (latitude, longitude);

    const options = {
      center: point,
      zoom: 15,
      disableDefaultUI: true,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      clickableIcons: false,
      scaleControl: true,
      mapTypeId: 'roadmap',
      styles: [
        {
            "featureType": "administrative.land_parcel",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "simplified"
                },
                {
                    "lightness": 20
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#f49935"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                {
                    "hue": "#fad959"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#a1cdfc"
                },
                {
                    "saturation": 30
                },
                {
                    "lightness": 49
                }
            ]
        }
      ]
    }

    this.map = new google.maps.Map (this.mapRef.nativeElement, options);

    var circle = new google.maps.Circle ({
      center: point,
      map: this.map,
      radius: 500,
      fillColor: '#CB9229',
      fillOpacity: 0.3,
      strokeColor: "#FFF",
      strokeWeight: 0
    });
  }

  async presentToast (message: any, color: string) {
    const toast = await this.toastController.create ({
      message: message,
      color: color,
      duration: 2500,
      position: 'top'
    });

    toast.present ();
  }

  back () {
      this.navController.back ();
  }

  toggled_favorite () {
    this.loadings.favorite = true;
    this.profile.tengo_favorito = !this.profile.tengo_favorito;
    this.database.set_favorite (this.id).subscribe ((res: any) => {
      console.log (res);
      this.loadings.favorite = false;
      if (res.status !== true) {
        this.profile.tengo_favorito = !this.profile.tengo_favorito;
      }
    }, error => {
      this.loadings.favorite = false;
      this.profile.tengo_favorito = !this.profile.tengo_favorito;
    });
  }

  async send_message () {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        chat_id: this.profile.id_chat,
        perfil: {
          id: this.profile.id,
          usernick: this.profile.usernick,
          edad: this.profile.edad,
          pais: this.profile.nombre_pais,
          ciudad: this.profile.nombre_ciudad,
          thumbnail: this.profile.foto_perfil
        }
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      this.get_profile ();
    });

    return await modal.present ();
  }
}
