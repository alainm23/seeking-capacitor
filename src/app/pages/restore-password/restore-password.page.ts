import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

// Services
import { AuthService } from '../../services/auth.service';
import { UtilsService } from '../../services/utils.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-restore-password',
  templateUrl: './restore-password.page.html',
  styleUrls: ['./restore-password.page.scss'],
})
export class RestorePasswordPage implements OnInit {
  form: FormGroup;
  constructor (private auth: AuthService, private toastController: ToastController,
    private utils: UtilsService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      email: new FormControl ('', [Validators.required, Validators.email])
    });
  }

  submit () {
    if (this.form.valid) {
      this.auth.recover_email (this.form.value.email).subscribe ((res: any) => {
        console.log (res);
      }, error => {
        console.log (error);
      });
    } else {
      this.presentToast (this.utils.get_translate ('Your email is required'), 'danger');
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
}
