import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService, IUser } from '../cognito.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  user: IUser;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.user = {} as IUser;
  }
  public signIn(): void {
    this.cognitoService.signIn(this.user).then(() => {
      this.router.navigate(['/home']);
    }).catch(() => {
      console.log("Something bad happened os signin in login component");
    });
  }
}
