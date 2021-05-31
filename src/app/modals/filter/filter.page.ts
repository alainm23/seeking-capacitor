import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

// Services
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
declare var google: any;

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {
  @ViewChild ('searchbar', { read: ElementRef, static: false }) searchbar: ElementRef;

  @Input () page: string;
  @Input () relationship: any;
  @Input () idiomas: any;
  @Input () personalidad_map: Map <string, number []> = new Map <string, number []> ();
  @Input () apariencia_map: Map <string, number []> = new Map <string, number []> ();
  @Input () extra_map: Map <string, number []> = new Map <string, number []> ();
  @Input () edad_range: any;
  @Input () location: any;

  // Lista para mostrar
  apariencias: any [] = [
    {
      id: 2,
      list: 'apariencia'
    },
    {
      id: 4,
      list: 'apariencia'
    },
    {
      id: 5,
      list: 'apariencia'
    },
    {
      id: 6,
      list: 'apariencia'
    }
  ];

  personalidad: any [] = [
    {
      id: 7,
      list: 'apariencia'
    },
    {
      id: 8,
      list: 'apariencia'
    },
    {
      id: 2,
      list: 'personalidad'
    },
    {
      id: 3,
      list: 'personalidad'
    },
    {
      id: 4,
      list: 'personalidad'
    }
  ];

  laboral: any [] = [
    {
      id: 5,
      list: 'personalidad'
    },
    {
      id: 6,
      list: 'personalidad'
    }
  ];

  show_apariencias: boolean = false;
  show_personalidad: boolean = false;
  show_laborales: boolean = false;

  constructor (private modalController: ModalController,
    public database: DatabaseService) { }

  ngOnInit () {
    if (this.database.RELACIONES.length <= 0)  {
      this.database.get_datos ('relaciones').subscribe ((res: any) => {
        this.database.RELACIONES = res;
        // console.log (res);
      }, error => {
        console.log (error);
      });
    }
    
    if (this.database.IDIOMAS.length <= 0) {
      this.database.get_datos ('idiomas').subscribe ((res: any) => {
        this.database.IDIOMAS = res;
        console.log (res);
      }, error => {
        console.log (error);
      });
    }

    if (this.database.PERSONALIDADES.length <= 0) {
      this.database.get_datos ('personalidades').subscribe ((res: any) => {
        console.log ('personalidades', res);
        this.database.PERSONALIDADES = res;
      }, error => {
        console.log (error);
      });
    }

    if (this.database.APARIENCIAS.length <= 0) {
      this.database.get_datos ('apariencias').subscribe ((res: any) => {
        console.log ('apariencias', res);
        this.database.APARIENCIAS = res;
      }, error => {
        console.log (error);
      });
    }

    if (this.database.EXTRAS.length <= 0) {
      this.database.get_datos ('extras').subscribe ((res: any) => {
        console.log ('extras', res);
        this.database.EXTRAS = res;
      }, error => {
        console.log (error);
      });
    }

    setTimeout(() => {
      this.initAutocomplete ();
    }, 500);
  }

  initAutocomplete () {
    const options = {
      types: ['(regions)']
      // types: ['geocode']
    };
    
    let searchInput = this.searchbar.nativeElement.querySelector ('input');
    let autocomplete = new google.maps.places.Autocomplete (searchInput, options);

    autocomplete.addListener ('place_changed', async () => {
      let place = autocomplete.getPlace ();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      console.log (place);

      this.get_location (place, place.geometry.location.lat(), place.geometry.location.lng());
    });
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

    let location = {
      ciudad: ciudad,
      pais: pais,
      pais_code: pais_code,
      referencias: referencias,
      latitud: latitude,
      longitud: longitude
    };

    console.log (location);
    this.location = location;
  }

  close () {
    this.modalController.dismiss (null, 'close');
  }

  filter () {
    this.modalController.dismiss ({
      relationship: this.relationship,
      idiomas: this.idiomas,
      personalidad_map: this.personalidad_map,
      apariencia_map: this.apariencia_map,
      extra_map: this.extra_map,
      edad_range: this.edad_range,
      location: this.location
    }, 'filter');
  }

  select_changed (event: any, key: string, list: string) {
    let map: Map <string, number []>;

    if (list === 'personalidad') {
      map = this.personalidad_map;
    } else if (list === 'apariencia') {
      map = this.apariencia_map;
    } else if (list === 'extra') {
      map = this.extra_map;
    }

    map.set (key, event.detail.value);
    console.log (map);
  }

  get_map_value (key: string, list: string) {
    let map: Map <string, number []>;

    if (list === 'personalidad') {
      map = this.personalidad_map;
    } else if (list === 'apariencia') {
      map = this.apariencia_map;
    } else if (list === 'extra') {
      map = this.extra_map;
    }

    if (map.has (key)) {
      return map.get (key);
    }

    return [];
  }

  get_subitems (id: number, list: string) {
    let returned: any [] = [];

    if (list === 'personalidad') {
      if (this.database.PERSONALIDADES.find (x => x.id === id) !== undefined) {
        returned = this.database.PERSONALIDADES.find (x => x.id === id).items;
      }
    } else if (list === 'apariencia') {
      if (this.database.APARIENCIAS.find (x => x.id === id) !== undefined) {
        returned = this.database.APARIENCIAS.find (x => x.id === id).items;
      }
    }

    return returned;
  }

  get_nombre (id: number, list: string) {
    let returned: string = '';

    if (list === 'personalidad') {
      if (this.database.PERSONALIDADES.find (x => x.id === id) !== undefined) {
        returned = this.database.PERSONALIDADES.find (x => x.id === id).nombre;
      }
    } else if (list === 'apariencia') {
      if (this.database.APARIENCIAS.find (x => x.id === id) !== undefined) {
        returned = this.database.APARIENCIAS.find (x => x.id === id).nombre;
      }
    }

    return returned;
  }
}
