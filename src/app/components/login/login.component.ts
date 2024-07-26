import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  
  constructor(private authService: AuthService, private router: Router){}

  login(){
    this.authService.login(this.username, this.password).subscribe(user => {
      if(user){
        this.router.navigate(['/dashboard']);
      }
      else{
        alert('Invalid credentials');
      }
    },
    error => {
      alert('Invalid credentials');
    })
  }
}
