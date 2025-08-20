import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { MessageService } from 'primeng/api';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { FloatLabelModule } from "primeng/floatlabel"
import { TranslateService } from '@ngx-translate/core';
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
  imports: [ReactiveFormsModule,DialogModule,DatePickerModule,InputNumber,FloatLabelModule,InputTextModule,TextareaModule,ButtonModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent implements OnInit,OnChanges, OnDestroy, IDeactivate{


  @Input() eventBasicInfo : EventBasicInfo;
  @Input() ticketToEdit?: Ticket;
  ticketForm : FormGroup;
  visible : boolean = false;
  isEditMode = false;
  @Output() ticketCreated = new EventEmitter<void>();

  currencyCode : string;
  localeCode : string;
  private langChangeSub: Subscription | undefined;

  constructor(
    private messageService : MessageService,
    private formValidationService : FormValidationService,
    private translateService : TranslateService,
    private apiService : ApiService,
    private confirmationDialogService : ConfirmationDialogService) {}

  ngOnInit(): void {

    this.initializeForm()

    const currentLang = this.translateService.currentLang || 'en';
    this.setLocalFormLang(currentLang);

       this.langChangeSub = this.translateService.onLangChange.subscribe(lang => {
        this.setLocalFormLang(lang.lang)
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['eventBasicInfo' ] && this.eventBasicInfo && this.ticketForm){
      this.ticketForm.reset()
      this.isEditMode = false;
    }

  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  show(){
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.ticketForm.reset();
    this.ticketToEdit = undefined;
    this.isEditMode = false;
  }

    async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.hide()
    }
  }

  showForEdit(ticket : Ticket){

    if(!ticket) return;

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

  initializeForm(){

     this.ticketForm = new FormGroup({
      name: new FormControl('',[Validators.required, CustomValidators.noWhitespaceValidator]),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      description: new FormControl('', CustomValidators.noWhitespaceValidator),
      quota: new FormControl('',[Validators.required,Validators.min(1)]),
      validFrom: new FormControl('', Validators.required),
      validUntil: new FormControl('', Validators.required)

    }, {validators: CustomValidators.startBeforeEndDates('validFrom','validUntil')})

  }

  private setLocalFormLang(lang : string){
      if (lang === 'sr') {
        this.currencyCode = 'RSD';
        this.localeCode = 'sr-RS';
      } else {
        this.currencyCode = 'EUR';
        this.localeCode = 'en-US';
      }
  }


  submitForm(){
    if(this.ticketForm.invalid){
      this.formValidationService.showValidationErrors(this.ticketForm,'Ticket');
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
    )

    if(this.isEditMode && this.ticketToEdit){
      ticketDto.setTicketId(this.ticketToEdit.getTicketID());

      this.apiService.updateTicket(ticketDto).subscribe({
        next: (msg) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
          this.ticketCreated.emit();
          this.hide();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      });
    }
    else{

      this.apiService.createTicket(ticketDto).subscribe({
        next: (msg) =>{
          this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
          this.ticketCreated.emit();
          this.hide();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      });

    }

  }

  canExit () : boolean | Observable<boolean> | Promise<boolean>{
    
    return (this.ticketForm.dirty || this.ticketForm.touched) ? this.confirmationDialogService.confirm(
        'You have unsaved changes. Are you sure you want to close the modal?',
        'Unsaved Changes'
      )
    : true;
    
  }

}
