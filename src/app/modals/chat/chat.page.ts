import { Component, OnInit, ViewChild, Input } from '@angular/core';

//Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import * as moment from 'moment';
import { WebsocketService } from '../../services/websocket.service';
import { ModalController, IonContent, IonInfiniteScroll, AlertController, ToastController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { CompleteProfilePage } from '../../modals/complete-profile/complete-profile.page';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild (IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild ('content') private content: any;
  @Input () chat_id: any;
  @Input () perfil: any;
  abierto: boolean = false;
  
  id_sender: string;
  id_recipient: string;

  message: string = '';
  messages: any [] = [];
  page: number = 0;

  loadings: any = {
    page: false,
    message: false
  };
  
  constructor (private database: DatabaseService,
    private modalController: ModalController,
    public auth: AuthService,
    public websocket: WebsocketService,
    public alertController: AlertController,
    public utils: UtilsService, 
    public toastController: ToastController) { }

  ngOnInit () {
    console.log (this.chat_id);

    if (this.chat_id !== null) {
      this.loadings.page = true;
      this.database.get_chat_data (this.chat_id).subscribe ((res: any) => {
        this.perfil = res.receptor;
  
        if (res.abierto_por_membresia === 1 || res.creditos > 0) {
          this.abierto = true;
        }
  
        this.init_chat_page ();
      }, error => {
        console.log (error);
      });
    } else {
      this.id_recipient = this.perfil.id;
    }
  }

  init_chat_page () {
    this.websocket.current_chat_opened = this.chat_id;
    this.infiniteScroll.disabled = true;

    this.id_recipient = this.perfil.id;
    this.id_sender = this.auth.USER_DATA.id;

    this.get_data (null, false);
  }

  ionViewDidLeave () {
    this.websocket.current_chat_opened = 0;
    // this.close_channel ();
  }

  get_data (event: any, join: boolean) {
    this.page++;

    console.log (this.page);

    this.database.get_chat (this.chat_id, this.page).subscribe ((res: any []) => {
      
      console.log (res);

      if (join) {
        res.forEach ((e: any) => {
          this.messages.unshift (e);
        });

        if (res.length < 15) {
          event.target.disabled = true;
        }
      } else {
        this.messages = res.reverse ();
      }

      this.loadings.page = false;
      console.log (this.messages);

      if (event === null) {
        setTimeout (() => {
          this.content.scrollToBottom ();
          setTimeout (() => {
            this.infiniteScroll.disabled = false;
          }, 250);
        }, 300);
        this.init_channel ();
      } else {
        event.target.complete ();
      }
    }, error => {
      console.log (error);
    });
  }

  close () {
    this.modalController.dismiss (null, 'close');
  }

  format_message (message: string) {
    if (message === 'wink') {
      return '😉️';
    }

    return message;
  }

  send_message () {
    if (this.message.trim () != "") {
      let message = new String (this.message);

      let id: string = Math.random ().toString ();

      this.messages.push ({
        created_at: new Date ().toISOString (),
        id: id,
        id_chat: this.chat_id,
        id_recipient: this.id_recipient,
        id_sender: this.id_sender,
        message: this.format_message (this.message),
        updated_at: new Date ().toISOString (),
        visto: 0
      });

      this.message = '';
      this.scrollToBottom ();
      
      this.database.send_message (this.perfil.id, message).subscribe ((res: any) => {
        console.log (res);
        if (res.status === false) {
          this.delete_message_by_id (id);
        }
      }, error => {
        this.delete_message_by_id (id);
        console.log (error);
        this.show_complete_alert (error.error.message);
      });
    }
  }

  async show_complete_alert (message: string) {
    const alert = await this.alertController.create({
      header: this.utils.get_translate ('Profile not completed'),
      message: message,
      mode: 'ios',
      buttons: [
        {
          text: this.utils.get_translate ('Complete profile'),
          handler: (blah) => {
            this.complete_profile ();
          }
        }, {
          text: this.utils.get_translate ('Later'),
          handler: () => {
            
          }
        }
      ]
    });

    await alert.present();
  }

  delete_message_by_id (id: string) {
    for (let index = 0; index < this.messages.length; index++) {
      if (this.messages [index].id === id) {
        this.messages.splice (index, 1);
      }
    }
  }

  scrollToBottom () {
    setTimeout (() => {
      this.content.scrollToBottom (250);
    }, 250);
  }

  init_channel () {
    this.websocket.create_channel ().listen ('.message', (res: any) => {
      if (res.chat.id === this.chat_id) {
        this.messages.push (res.message);
        this.scrollToBottom ();
      }
    });
  }

  get_date_format (date: string) {
    if (date === null || date === undefined || date === '') {
      return '';
    }

    let datetime: moment.Moment = moment (date);

    if (datetime.isSame (moment (), 'day')) {
      return moment (date).format ('LT');
    } else if (datetime.isSame (moment (), 'year')) {
      return moment (date).format ('DD [de] MM HH:MM');
    } else {
      return moment (date).format ('lll');
    }
  }

  pagar_credito () {
    this.loadings.page = true;

    let request: any = {
      id_user: this.id_recipient
    };

    console.log (request);

    this.database.open_chat (request).subscribe ((res: any) => {
      console.log (res);
      if (res.status === true) {
        this.auth.update_user ();
        this.page = 0;
        this.loadings.page = true;
        this.abierto = true;
        this.chat_id = res.chat.id;
        this.init_chat_page ();
      } else {
        this.presentToast (res.message, 'danger');
        this.loadings.page = false;
      }
    }, error => {
      this.loadings.page = false;
      console.log (error);
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

  async complete_profile () {
    const modal = await this.modalController.create ({
      component: CompleteProfilePage,
      swipeToClose: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios'
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'update') {

      }
    });

    return await modal.present ();
  }

  valid_before_element () {
    
  }
}
