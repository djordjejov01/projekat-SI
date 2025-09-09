import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../Validators/custom.validators'; 
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { Observable } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../Services/api.service'; 
import { MessageService } from 'primeng/api';
import { IDeactivate } from '../../../Interfaces/IDeactivate'; 
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service'; 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    DialogModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    ToastModule
  ],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.css'],
  providers: [MessageService] 
})
export class ForgotPasswordModalComponent implements OnInit, IDeactivate {
  emailForm: FormGroup;
  visible: boolean = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.emailForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        CustomValidators.noWhitespaceValidator,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]),
    });
  }

  show(): void {
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.emailForm.reset();
  }

  async onCancleClick() {
    const canLeave = await this.canExit();
    if (canLeave) {
      this.hide();
    }
  }

  submitForm() {
    if (this.emailForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('ERROR'),
        detail: this.translate.instant('FORGOT_PASS.EMAIL_NOT_VALID'),
        life: 3000
      });
      return;
    }

    const email = this.emailForm.get('email')?.value;

    this.apiService.forgotPassword(email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('FORGOT_PASS.LINK_SENT'),
          life: 3000
        });
        this.hide();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: this.translate.instant('FORGOT_PASS.LINK_FAILED'),
          life: 3000
        });
      }
    });
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return (this.emailForm.dirty || this.emailForm.touched)
      ? this.confirmationDialogService.confirm(
          this.translate.instant('ACTIVITY.UNSAVED_MESSAGE'),
          this.translate.instant('ACTIVITY.UNSAVED_TITLE')
        )
      : true;
  }
}
