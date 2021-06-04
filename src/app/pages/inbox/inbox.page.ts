import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { ChatPage } from '../../modals/chat/chat.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {
  page: number = 0;
  tab: string = "all";

  is_loading: boolean = false;
  items: any [] = [];
  _items: any [] = [];
  constructor (private database: DatabaseService,
    private modalController: ModalController,
    private auth: AuthService) { }

  ngOnInit () {
    this.is_loading = true;
    this.get_data (null, false, '');
  }

  get_data (event: any, join: boolean, type: string) {
    if (type === 'refresher') {
      // event.target.disabled = false;
      this.page = 1;
    } else if (type === 'infinite-scroll') {
      event.target.disabled = false;
      this.page = this.page + 1;
    } else {
      this.page = this.page + 1;
    }

    this.database.get_chats (this.page, this.tab).subscribe ((res: any []) => {
      console.log (res);
      if (join) {
        res.forEach ((e: any) => {
          this.items.push (e);
          this._items.push (e);
        });
      } else {
        this.items = res.slice ();
        this._items = res.slice ();
      }

      if (event === null) {
        this.is_loading = false;
      } else {
        event.target.complete ();
      }
    }, error => {
      console.log (error);
      if (event === null) {
        this.is_loading = false;
      } else {
        event.target.complete ();
      }
    });
  }

  async view_chat (item: any) {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        chat_id: item.id
      }
    });

    return await modal.present ();
  }

  async open_upgrade_menu () {
    this.database.open_upgrade_menu ();
  }

  select_changed (event: any) {
    this.page = 0;
    this.items = [];
    this._items = [];
    this.is_loading = true;
    this.get_data (null, false, '');
  }

  filter (event: any) {
    console.log (event.detail.value);
    this.items = this._items;
    if (event.detail.value.trim () !== '') {
      this.items = this.items.filter ((item: any) => {
        return item.receptor.usernick.toLowerCase ().indexOf (event.detail.value.toLowerCase ()) > -1; 
      });
    }
  }

  get_checkmark_visible (last_message: any) {
    let returned: boolean = false;

    if (this.auth.USER_DATA.id === last_message.id_sender) {
      returned = true;
    }

    return returned;
  }
}
