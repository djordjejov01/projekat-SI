import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
      rememberMe: [false],
    });
  }

  submit() {
    this.userService.createUser(this.userForm.value).subscribe({
      next: () => alert('User created!'),
      error: () => alert('Failed to create user'),
    });
  }
}
