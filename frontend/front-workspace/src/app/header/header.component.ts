import { Component } from '@angular/core';
import { CognitoService } from '../cognito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private cognitoService: CognitoService) {  
  }
  
  public isAuthenticated(): boolean {
    return this.cognitoService.isAuthenticated()
  }
}
