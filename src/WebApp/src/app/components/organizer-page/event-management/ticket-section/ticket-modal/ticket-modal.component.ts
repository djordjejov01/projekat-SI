import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-modal',
  imports: [ReactiveFormsModule,DialogModule,DatePickerModule,InputNumber,FloatLabelModule,InputTextModule,TextareaModule,ButtonModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent implements OnInit,OnChanges, OnDestroy{


  @Input() eventBasicInfo : EventBasicInfo;
  ticketForm : FormGroup;
  visible : boolean = false;

  currencyCode : string;
  localeCode : string;
  private langChangeSub: Subscription | undefined;

  constructor(private messageService : MessageService, private formValidationService : FormValidationService, private translateService : TranslateService) {}

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

    console.log(this.ticketForm.value)
  }

}
