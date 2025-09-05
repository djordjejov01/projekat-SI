import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { MessageService } from 'primeng/api';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from "primeng/floatlabel";
import { TranslateModule,TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { Observable, Subscription } from 'rxjs';
import { ApiService } from '../../../../../Services/api.service';
import { TicketDto } from '../../../../../Models/TicketDto';
import { Ticket } from '../../../../../Models/Ticket';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';

@Component({
  selector: 'app-ticket-modal',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    DatePickerModule,
    InputNumberModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    TranslateModule
  ],
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css']
})
export class TicketModalComponent implements OnInit, OnChanges, OnDestroy, IDeactivate {

  @Input() eventBasicInfo: EventBasicInfo;
  @Input() ticketToEdit?: Ticket;
  ticketForm: FormGroup;
  visible: boolean = false;
  isEditMode = false;
  @Output() ticketCreated = new EventEmitter<void>();

  currencyCode: string;
  localeCode: string;
  private langChangeSub: Subscription | undefined;

  constructor(
    private messageService: MessageService,
    private formValidationService: FormValidationService,
    private translateService: TranslateService,
    private apiService: ApiService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const currentLang = this.translateService.currentLang || 'en';
    this.setLocalFormLang(currentLang);

    this.langChangeSub = this.translateService.onLangChange.subscribe(lang => {
      this.setLocalFormLang(lang.lang);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventBasicInfo'] && this.eventBasicInfo && this.ticketForm) {
      this.ticketForm.reset();
      this.isEditMode = false;
    }
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.ticketForm.reset();
    this.ticketToEdit = undefined;
    this.isEditMode = false;
  }

  async onCancleClick() {
    const canLeave = await this.canExit();
    if (canLeave) {
      this.hide();
    }
  }

  showForEdit(ticket: Ticket) {
    if (!ticket) return;

    this.ticketToEdit = ticket;
    this.isEditMode = true;

    this.ticketForm.patchValue({
      name: this.ticketToEdit.getTypeName(),
      price: this.ticketToEdit.getPrice(),
      description: this.ticketToEdit.getDescription(),
      quota: this.ticketToEdit.getQuota(),
      validFrom: new Date(this.ticketToEdit.getValidFrom()),
      validUntil: new Date(this.ticketToEdit.getValidUntil()),
    });

    this.visible = true;
  }

  initializeForm() {
    this.ticketForm = new FormGroup({
      name: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      price: new FormControl('', [Validators.required, Validators.min(1)]),
      description: new FormControl('', CustomValidators.noWhitespaceValidator),
      quota: new FormControl('', [Validators.required, Validators.min(1)]),
      validFrom: new FormControl('', Validators.required),
      validUntil: new FormControl('', Validators.required)
    }, { validators: CustomValidators.startBeforeEndDates('validFrom', 'validUntil') });
  }

  private setLocalFormLang(lang: string) {
    if (lang === 'sr') {
      this.currencyCode = 'RSD';
      this.localeCode = 'sr-RS';
    } else {
      this.currencyCode = 'EUR';
      this.localeCode = 'en-US';
    }
  }

  submitForm() {
    if (this.ticketForm.invalid) {
      this.formValidationService.showValidationErrors(
        this.ticketForm,
        this.translateService.instant('TICKET')
      );
      return;
    }

    const formValue = this.ticketForm.value;

    const ticketDto = new TicketDto(
      formValue.name,
      formValue.price,
      formValue.description,
      formValue.quota,
      formValue.validFrom,
      formValue.validUntil,
      this.eventBasicInfo.getEventID()
    );

    if (this.isEditMode && this.ticketToEdit) {
      ticketDto.setTicketId(this.ticketToEdit.getTicketID());

      this.apiService.updateTicket(ticketDto).subscribe({
        next: (msg) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SUCCESS'),
            detail: msg
          });
          this.ticketCreated.emit();
          this.hide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: err.message
          });
        }
      });
    } else {
      this.apiService.createTicket(ticketDto).subscribe({
        next: (msg) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SUCCESS'),
            detail: msg
          });
          this.ticketCreated.emit();
          this.hide();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: err.message
          });
        }
      });
    }
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return (this.ticketForm.dirty || this.ticketForm.touched)
      ? this.confirmationDialogService.confirm(
          this.translateService.instant('UNSAVED_CHANGES_MESSAGE'),
          this.translateService.instant('UNSAVED_CHANGES_TITLE')
        )
      : true;
  }
}
