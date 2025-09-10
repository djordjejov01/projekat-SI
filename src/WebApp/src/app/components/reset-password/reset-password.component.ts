import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../Validators/custom.validators';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ApiService } from '../../Services/api.service';
import { ResetPasswordDto } from '../../Models/ResetPasswordDto';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    PasswordModule,
    DividerModule,
    FloatLabelModule,
    RouterLink
  ],
  standalone: true,
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit {

  resetForm: FormGroup;
  token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No token found in the URL. Please use the link from your email.',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    });

    this.resetForm = new FormGroup({
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)
      ])
    }, CustomValidators.passwordsMatch('newPassword', 'confirmPassword'));
  }

  submitForm(): void {
    if (this.resetForm.valid && this.token) {
      const resetData: ResetPasswordDto = {
        token: this.token,
        newPassword: this.resetForm.get('newPassword')?.value
      };
      //console.log(resetData)
      this.apiService.resetPassword(resetData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Your password has been reset successfully.',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorResponse.message || 'Failed to reset password. Please try again.',
            life: 3000
          });
        }
      });
    } else {
      let warningString = 'Form fields are not valid:\n';

      const newPasswordControl = this.resetForm.get('newPassword');
      const confirmPasswordControl = this.resetForm.get('confirmPassword');

      // Check for errors on individual controls
      if (newPasswordControl?.errors) {
        if (newPasswordControl.errors['required']) {
          warningString += ' * New Password is required\n';
        }
        if (newPasswordControl.errors['pattern']) {
          warningString += ' * New Password must match the pattern\n';
        }
      }

      if (confirmPasswordControl?.errors) {
        if (confirmPasswordControl.errors['required']) {
          warningString += ' * Confirmation is required\n';
        }
        if (confirmPasswordControl.errors['pattern']) {
          warningString += ' * Confirmation must match the pattern\n';
        }
      }

      // Check for form group errors (like passwords not matching)
      if (this.resetForm.errors?.['passwordsDontMatch']) {
        warningString += ' * New password and Confirmation must match\n';
      }

      this.messageService.add({ severity: 'error', summary: 'Form fields are not valid:', detail: warningString, life: 3000 });
    }
  }
}