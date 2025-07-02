import { Component, OnInit} from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomValidators } from '../../Validators/custom.validators';
import { ToastModule } from 'primeng/toast';
import { MessageService} from 'primeng/api';
import { IDeactivate } from '../../Interfaces/IDeactivate';
import { Observable } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ExitFormConformation } from '../../Services/exitConformation.service';
import { RegisterDto } from '../../Models/RegisterDto';
import { ApiService } from '../../Services/api.service';
import { UserDto } from '../../Models/UserDto';

@Component({
  selector: 'app-register-form',
  imports: [
    SelectModule,
    ReactiveFormsModule,
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    KnobModule,
    FormsModule,
    RouterLink,
    ToastModule,
    ConfirmDialog],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterForm implements OnInit,IDeactivate{

  constructor(
    private messageService: MessageService,
    private exitFormConformation : ExitFormConformation,
    private apiService : ApiService) {}

  roles: String[] | undefined;
  userToRegister : RegisterDto | undefined;

  registerForm : FormGroup;

  ngOnInit(): void {
    this.roles = [
      'Organizer',
      'Supplier'
    ]

    this.registerForm = new FormGroup({
      role: new FormControl(null, Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
      password: new FormControl('', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)]),
      confirm: new FormControl('',[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)])
    
    }, CustomValidators.passwordsMatch)
    
  }

  submitForm()
  {
    
    if(this.registerForm.valid)
    {
        this.userToRegister = new RegisterDto(
        this.registerForm.get('username').value,
        this.registerForm.get('email').value,
        this.registerForm.get('password').value,
        this.registerForm.get('confirm').value,
        this.registerForm.get('role').value
        )

        //API LOGIC HERE
        this.apiService.register(this.userToRegister).subscribe({
          next: (response : UserDto) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `User ${response.getUsername()} Successfully Registered`,
              life: 3000});

            this.registerForm.reset()
          },

          error: (errorResponse) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
          }
        });

        console.log('New user to register: ' , this.userToRegister)
        
    } 
    else
    {

      let warningString : string = 'Form Fields not Valid:\n';

        for(let key in this.registerForm.controls)
          {
            switch(this.registerForm.controls[key])
            {
              case this.registerForm.controls['role']: 
              {
                if (this.registerForm.controls['role'].errors?.['required']) warningString += " * Role is required\n";
              } break;

              case this.registerForm.controls['username']: 
              {
                if (this.registerForm.controls['username'].errors?.['required']) warningString += " * Name is required\n";
              } break;

              case this.registerForm.controls['email']:
              {
                if (this.registerForm.controls['email'].errors?.['required']) warningString += "  * Email is required\n";
                else if (this.registerForm.controls['email'].errors?.['pattern']) warningString += "  * Email is not valid\n";
              } break;

              case this.registerForm.controls['password']:
              {
                if (this.registerForm.controls['password'].errors?.['required']) warningString += " * Password is required\n";
                else if (this.registerForm.controls['password'].errors?.['pattern']) warningString += " * Password must match the pattern\n";
              } break;

              case this.registerForm.controls['confirm']:
              {
                if (this.registerForm.controls['confirm'].errors?.['required']) warningString += "  * Confirmation is required\n";
                else if (this.registerForm.controls['confirm'].errors?.['pattern']) warningString += "  * Confirmation must match the pattern\n";
              } break;

              default: warningString += "  * Somthing went wrong\n";
            }
        }

        if(this.registerForm.errors?.['passwordsDontMatch']) warningString += "  * Password and Confirmation must match\n";

       this.messageService.add({ severity: 'warn', summary: 'Warn Message', detail: warningString , life: 3000 });
       return;

    }

  }


    canExit() : boolean | Observable<boolean> | Promise<boolean>
    {
      this.userToRegister = new RegisterDto(
        this.registerForm.get('username').value,
        this.registerForm.get('email').value,
        this.registerForm.get('password').value,
        this.registerForm.get('confirm').value,
        this.registerForm.get('role').value
      )

      return (
        this.userToRegister.getRole()      ||
        this.userToRegister.getUsername()  ||
        this.userToRegister.getEmail()     ||
        this.userToRegister.getPassword()  ||
        this.userToRegister.getConfirmPassword()) ?  this.exitFormConformation.confirmExit() :  true;
    }

}
