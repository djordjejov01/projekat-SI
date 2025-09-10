import { Component, OnInit, HostListener } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { KnobModule } from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomValidators } from '../../Validators/custom.validators';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IDeactivate } from '../../Interfaces/IDeactivate';
import { Observable } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationDialogService } from '../../Services/confirmation-dialog.service';
import { RegisterDto } from '../../Models/RegisterDto';
import { ApiService } from '../../Services/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../Services/LanguageService';
import { RegResponseDto } from '../../Models/RegResponseDto';

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
    ConfirmDialog,
    TranslateModule
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterForm implements OnInit, IDeactivate {

  public currentLanguage: string;
  roles: Object[];
  userToRegister: RegisterDto | undefined;
  registerForm: FormGroup;

  constructor(
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private apiService: ApiService,
    private translate: TranslateService,
    private router: Router,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    const savedLang = this.languageService.language();
    this.currentLanguage = savedLang || 'en';

    this.setTranslatedRoles();

    this.translate.onLangChange.subscribe(() => {
      this.setTranslatedRoles();
    });

    this.registerForm = new FormGroup({
      role: new FormControl(null, Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)
      ]),
      confirm: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)
      ])
    }, CustomValidators.passwordsMatch('password', 'confirm'));
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;

    this.currentLanguage = lang;
    this.languageService.setLanguage(lang);
    this.translate.use(lang);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.submitForm();
  }

  setTranslatedRoles() {
    this.roles = [
      { label: this.translate.instant('ROLES.ORGANIZER'), value: 'Organizer' },
      { label: this.translate.instant('ROLES.SUPPLIER'), value: 'Supplier' }
    ];
  }

  submitForm() {
    if (this.registerForm.valid) {
      this.userToRegister = new RegisterDto(
        this.registerForm.get('username').value,
        this.registerForm.get('email').value,
        this.registerForm.get('password').value,
        this.registerForm.get('confirm').value,
        this.registerForm.get('role').value
      );

      this.apiService.register(this.userToRegister).subscribe({
        next: (response: RegResponseDto) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('REGISTERR.SUCCESS'),
            detail: response.getMessage(),
            life: 3000
          });

          this.registerForm.reset();
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 3000);
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: errorResponse.message,
            life: 3000
          });
        }
      });
    } else {
      let warningString: string = this.translate.instant('REGISTERR.FORM_INVALID') + '\n';

      for (let key in this.registerForm.controls) {
        switch (this.registerForm.controls[key]) {
          case this.registerForm.controls['role']: {
            if (this.registerForm.controls['role'].errors?.['required'])
              warningString += " * " + this.translate.instant('REGISTERR.ROLE_REQUIRED') + "\n";
          } break;

          case this.registerForm.controls['username']: {
            if (this.registerForm.controls['username'].errors?.['required'])
              warningString += " * " + this.translate.instant('REGISTERR.NAME_REQUIRED') + "\n";
          } break;

          case this.registerForm.controls['email']: {
            if (this.registerForm.controls['email'].errors?.['required'])
              warningString += " * " + this.translate.instant('REGISTERR.EMAIL_REQUIRED') + "\n";
            else if (this.registerForm.controls['email'].errors?.['pattern'])
              warningString += " * " + this.translate.instant('REGISTERR.EMAIL_INVALID') + "\n";
          } break;

          case this.registerForm.controls['password']: {
            if (this.registerForm.controls['password'].errors?.['required'])
              warningString += " * " + this.translate.instant('REGISTERR.PASSWORD_REQUIRED') + "\n";
            else if (this.registerForm.controls['password'].errors?.['pattern'])
              warningString += " * " + this.translate.instant('REGISTERR.PASSWORD_PATTERN') + "\n";
          } break;

          case this.registerForm.controls['confirm']: {
            if (this.registerForm.controls['confirm'].errors?.['required'])
              warningString += " * " + this.translate.instant('REGISTERR.CONFIRM_REQUIRED') + "\n";
            else if (this.registerForm.controls['confirm'].errors?.['pattern'])
              warningString += " * " + this.translate.instant('REGISTERR.CONFIRM_PATTERN') + "\n";
          } break;

          default:
            warningString += " * " + this.translate.instant('REGISTERR.UNKNOWN_ERROR') + "\n";
        }
      }

      if (this.registerForm.errors?.['passwordsDontMatch'])
        warningString += " * " + this.translate.instant('REGISTERR.PASSWORDS_MUST_MATCH') + "\n";

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('REGISTERR.FORM_INVALID'),
        detail: warningString,
        life: 3000
      });
    }
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return (this.registerForm.dirty || this.registerForm.touched)
      ? this.confirmationDialogService.confirm(
        this.translate.instant('UNSAVED_CHANGES_DETAIL'),
        this.translate.instant('UNSAVED_CHANGES_TITLE')
      )
      : true;
  }
}
