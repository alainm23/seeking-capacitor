import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restore-password',
  templateUrl: './restore-password.page.html',
  styleUrls: ['./restore-password.page.scss'],
})
export class RestorePasswordPage implements OnInit {
  email: string;
  constructor (private auth: AuthService) { }

  ngOnInit() {
  }

  submit () {
    if (this.email.trim () !== '') {

    } else {
      
    }
  }
}
