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
import { ConfirmationDialogService } from '../../Services/confirmation-dialog.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { RouterLink } from '@angular/router';
import { LoginDto } from '../../Models/LoginDto';
import { ApiService } from '../../Services/api.service';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HostListener } from '@angular/core';
import { LanguageService } from '../../Services/LanguageService';
import { FormsModule } from '@angular/forms';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CommonModule,
    PasswordModule,
    DividerModule,
    ToastModule,
    ConfirmDialog,
    RouterLink,
    TranslateModule,
    FormsModule,
    ForgotPasswordModalComponent
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginForm implements OnInit, IDeactivate {
  public currentLanguage: string;

  constructor(
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  userToLogin: LoginDto | undefined;
  loginForm: FormGroup;

  ngOnInit(): void {
    const savedLang = this.languageService.language();
    this.currentLanguage = savedLang || 'en';
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required),
    });
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;

    this.currentLanguage = lang;
    this.languageService.setLanguage(lang);
    this.translate.use(lang);
  }

  submitForm() {
    if (this.loginForm.valid) {
      this.userToLogin = new LoginDto(
        this.loginForm.get('email').value,
        this.loginForm.get('password').value
      );

      this.apiService.login(this.userToLogin).subscribe({
        next: (response: string) => {
          const result = this.authService.setToken(response);
          const role = this.authService.getUserRole();

          if (result === 'ok') {
            sessionStorage.setItem('showWelcome', 'true');
            switch (role) {
              case 'Admin': this.router.navigate(['/admin']); break;
              case 'Organizer': this.router.navigate(['/organizer']); break;
              case 'Supplier': this.router.navigate(['/supplier']); break;
              default:
                this.authService.logout();
                this.router.navigate(['/login']);
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('LOGING.ERROR'),
                  detail: this.translate.instant('LOGING.INVALID_ROLE'),
                  life: 3000
                });
                return;
            }
            this.loginForm.reset();
          } else if (result === 'unauthorized') {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('LOGING.ACCESS_DENIED'),
              detail: this.translate.instant('LOGING.NO_ACCESS_ALLOWED'),
              life: 3000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('LOGING.ERROR'),
              detail: this.translate.instant('LOGING.SOMETHING_ELSE'),
              life: 3000
            });
          }
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail: errorResponse.message,
            life: 3000
          });
        }
      });
    } else {
      let warningString: string = this.translate.instant('LOGING.FORM_INVALID') + '\n';

      if (this.loginForm.controls['email'].errors?.['required']) {
        warningString += "  * " + this.translate.instant('LOGING.EMAIL_REQUIRED') + "\n";
      }

      if (this.loginForm.controls['password'].errors?.['required']) {
        warningString += "  * " + this.translate.instant('LOGING.PASSWORD_REQUIRED') + "\n";
      }

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('LOGING.FORM_INVALID'),
        detail: warningString,
        life: 3000
      });
      return;
    }
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return (this.loginForm.dirty || this.loginForm.touched)
      ? this.confirmationDialogService.confirm(
          this.translate.instant('COMMON.UNSAVED_CHANGES_DETAIL'),
          this.translate.instant('COMMON.UNSAVED_CHANGES_TITLE')
        )
      : true;
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.submitForm();
  }
}
