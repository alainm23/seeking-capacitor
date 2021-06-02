import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
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
  constructor (private database: DatabaseService,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private navController: NavController,
    private toastController: ToastController) { }

  async ngOnInit () {
    this.id = this.route.snapshot.paramMap.get ('id');

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

    //   this.database.perfil_visitado (this.id).subscribe ((res: any) => {
    //     console.log (res);
    //   }, error => {
    //     console.log (error);
    //   });
    }, error => {
      console.log (error);
      loading.dismiss ();
    });
  }

  send_wink (item: any) {
    this.database.send_wink (this.id).subscribe ((res: any) => {
      console.log (res);
      this.presentToast (res.message, res.status === true ? 'success' : 'danger');
    }, error => {
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

//   toggled_favorite (item: any) {
//     item.tengo_favorito = !item.tengo_favorito;
//     this.database.set_favorite (item.id).subscribe ((res: any) => {
//       if (res.status !== true) {
//         item.tengo_favorito = !item.tengo_favorito;
//         this.presentToast ('Unable to set favorite, try one more time.', 'danger');
//       }
//     }, error => {
//       item.tengo_favorito = !item.tengo_favorito;
//       this.presentToast ('Unable to set favorite, try one more time.', 'danger');
//     });
//   }
}
