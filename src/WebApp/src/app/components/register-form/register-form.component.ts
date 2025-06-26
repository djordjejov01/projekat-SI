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

@Component({
  selector: 'app-register-form',
  imports: [SelectModule,ReactiveFormsModule,CommonModule,FloatLabelModule,InputTextModule,PasswordModule,DividerModule,KnobModule,FormsModule,RouterLink],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterForm implements OnInit{

  value: string | undefined;

  roles: String[] | undefined;
  progress : number = 0;
  private progressInterval: any;
  selectedRole : string | undefined;
  username : string | undefined;
  email : string | undefined;
  password : string | undefined;

  registerForm : FormGroup;

  ngOnInit(): void {
    this.roles = [
      'Organizer',
      'Supplier'
    ]

    this.registerForm = new FormGroup({
      role: new FormControl(null, Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      confirm: new FormControl('',Validators.required)
    
    })

    this.registerForm.valueChanges.subscribe(()=>{
      this.updateProgress();
    })
    
  }

  show(){
    console.log(this.selectedRole)
  }

  onFormSubmit(){
    console.log(this.registerForm?.value)
  }

  onSelectedRole(selectObj : any){
    this.selectedRole = selectObj.value;
    console.log(this.selectedRole)
  }

  updateProgress(){
    const controls = this.registerForm.controls;
    const total = Object.keys(controls).length;

    let validCount = 0;
    for(let key in controls){
      if(controls[key].valid && controls[key].value) validCount++;
    }


    let newProgress = (validCount / total) * 100;

     if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }

    this.progressInterval = setInterval(()=>{
      if(this.progress < newProgress) {
        this.progress += 1;
        if(this.progress >= newProgress){
          this.progress = newProgress;
          clearInterval(this.progressInterval)
        }
      }
      else if( this.progress > newProgress){
        this.progress -= 1;
        if(this.progress <= newProgress){
          this.progress = newProgress;
          clearInterval(this.progressInterval)
        }
      }
    }, 50)
  }

}
