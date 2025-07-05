import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { IDeactivate } from '../../Interfaces/IDeactivate';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ExitFormConformation } from '../../Services/exitConformation.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { RouterLink } from '@angular/router';
import { LoginDto } from '../../Models/LoginDto';
import { ApiService } from '../../Services/api.service';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule,FloatLabelModule,InputTextModule,CommonModule,PasswordModule,DividerModule,ToastModule,ConfirmDialog,RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginForm implements OnInit,IDeactivate{


  constructor(
    private messageService: MessageService,
    private exitFormConformation : ExitFormConformation,
    private apiService : ApiService,
    private authService : AuthService,
    private router : Router) {}

  userToLogin : LoginDto | undefined;
  loginForm : FormGroup;


  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required),
    })
  }

  submitForm()
  {
    if(this.loginForm.valid)
      {
        this.userToLogin = new LoginDto(
        this.loginForm.get('email').value,
        this.loginForm.get('password').value
        )
        
        //API LOGIC HERE
        this.apiService.login(this.userToLogin).subscribe({
          next: (response : string) => {

            this.authService.setToken(response)
            // console.log(localStorage.getItem('access_token'))
            // console.log(this.authService.getDecodedToken())
            // console.log(this.authService.getUserRole())
            const role = this.authService.getUserRole();
            sessionStorage.setItem('showWelcome', 'true');

            switch(role){
              case 'Admin': this.router.navigate(['/admin']); break;
              case 'Organizer': this.router.navigate(['/organizer']); break;
              case 'Supplier': this.router.navigate(['/supplier']); break;
              default: this.router.navigate(['/login'])
            }

            this.loginForm.reset()
          },
          error: (errorResponse) => {
             this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
          }
        })
       

        // console.log('New user to login: ', this.userToLogin)
      } 
      else
      {

        let warningString : string = 'Form Fields not Valid:\n';

          for(let key in this.loginForm.controls)
          {
              switch(this.loginForm.controls[key])
              {
                case this.loginForm.controls['email']:
                {
                  if (this.loginForm.controls['email'].errors?.['required']) warningString += "  * Email is required\n";
                } break;

                case this.loginForm.controls['password']:
                {
                  if (this.loginForm.controls['password'].errors?.['required']) warningString += " * Password is required\n";
                } break;

                default: warningString += "  * Somthing went wrong\n";
              }
          }

        this.messageService.add({ severity: 'warn', summary: 'Warn Message', detail: warningString , life: 3000 });
        return;

      }

  }

  canExit () : boolean | Observable<boolean> | Promise<boolean>{

    this.userToLogin = new LoginDto(
      this.loginForm.get('email').value,
      this.loginForm.get('password').value
    )

    return ( 
      this.userToLogin.getEmail() ||
      this.userToLogin.getPassword()) ? this.exitFormConformation.confirmExit() : true;

  }

}
