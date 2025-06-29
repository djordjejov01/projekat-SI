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

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule,FloatLabelModule,InputTextModule,CommonModule,PasswordModule,DividerModule,ToastModule,ConfirmDialog,RouterLink],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginForm implements OnInit,IDeactivate{


  constructor(private messageService: MessageService,private exitFormConformation : ExitFormConformation) {}

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
        //const formData = this.loginForm.value;
        this.userToLogin = new LoginDto(
        this.loginForm.get('email').value,
        this.loginForm.get('password').value
        )
        console.log('New user to login: ', this.userToLogin)
        //API LOGIC HERE
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login Request Sent', life: 3000});
        this.loginForm.reset()
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

      }

  }

  canExit () : boolean | Observable<boolean> | Promise<boolean>{
    
    // this.email = this.loginForm.get('email').value;
    // this.password = this.loginForm.get('password').value;

    this.userToLogin = new LoginDto(
      this.loginForm.get('email').value,
      this.loginForm.get('password').value
    )

    return ( 
      this.userToLogin.getEmail() ||
      this.userToLogin.getPassword()) ? this.exitFormConformation.confirmExit() : true;

  }

}
