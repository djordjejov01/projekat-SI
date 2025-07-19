import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators,ReactiveFormsModule, AbstractControl} from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { CustomValidators } from '../../../Validators/custom.validators';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TicketDto } from '../../../Models/TicketDto';
import { CreatEventDto } from '../../../Models/CreateEventDto';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { CategoryMap } from '../../../Models/Event';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'app-create-event',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputTextModule,Checkbox,TextareaModule,DatePickerModule,InputNumber,ButtonModule,FileUpload,SelectModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent implements OnInit{

  eventForm : FormGroup;
  currencyCode : string;
  localeCode : string;
  minDate : Date;
  selectedImageFile: File | null = null;
  categories = [];

  eventStart: Date | null = null;
  eventEnd: Date | null = null;

  constructor( 
    private translateService : TranslateService,
    private messageService : MessageService,
    private route : ActivatedRoute,
    private apiService : ApiService,
    private authService : AuthService) {}

  ngOnInit(): void {

      this.minDate = new Date();

      this.categories = Object.entries(CategoryMap).map(([key,label]) => ({
        label,
        value: label
      }))

      const currentLang = this.translateService.currentLang || 'en';
      if (currentLang === 'sr') {
        this.currencyCode = 'RSD';
        this.localeCode = 'sr-RS';
      } else {
        this.currencyCode = 'EUR';
        this.localeCode = 'en-US';
      }

   this.translateService.onLangChange.subscribe(lang => {
      if (lang.lang === 'sr') {
        this.currencyCode = 'RSD';
        this.localeCode = 'sr-RS';
      } else {
        this.currencyCode = 'EUR';
        this.localeCode = 'en-US';
      }
    });

    this.eventForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', CustomValidators.noWhitespaceValidator),
      location: new FormControl('', [Validators.required,CustomValidators.noWhitespaceValidator]),
      isUnlimitedCapacity: new FormControl(false),
      capacity: new FormControl('', [Validators.required,Validators.min(1)]),
      startDateTime: new FormControl('', [Validators.required,CustomValidators.notInPast]),
      endDateTime: new FormControl('', Validators.required),
      category: new FormControl('',Validators.required),
      tickets: new FormArray([
        new FormGroup({
          name: new FormControl('',[Validators.required, CustomValidators.noWhitespaceValidator]),
          price: new FormControl('', [Validators.required, Validators.min(0)]),
          description: new FormControl('', CustomValidators.noWhitespaceValidator),
          quota: new FormControl('',[Validators.required,Validators.min(1)]),
          validFrom: new FormControl({value: '', disabled: true}, Validators.required),
          validUntil: new FormControl({value: '', disabled: true},Validators.required)

        }, {validators: CustomValidators.startBeforeEndDates('validFrom','validUntil')}),
      ]),
    }, {validators: CustomValidators.startBeforeEndDates('startDateTime','endDateTime') })


    this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited)=>{

        const capacityControl = this.eventForm.get('capacity');
        if(unlimited){
          capacityControl?.disable();
          capacityControl?.clearValidators();
          capacityControl?.setValue(null);
          capacityControl.updateValueAndValidity();
        }else{
          capacityControl?.enable()
          capacityControl?.setValidators([Validators.required,Validators.min(1)]);
          capacityControl.updateValueAndValidity();
        }

      });

      this.eventForm.get('startDateTime')?.valueChanges.subscribe( value =>{
        this.eventStart = value;
        this.toggleTicketDateControls()
      });

      this.eventForm.get('endDateTime')?.valueChanges.subscribe( value =>{
        this.eventEnd = value;
        this.toggleTicketDateControls()
      });

      this.eventForm.get('isUnlimitedCapacity')?.updateValueAndValidity({onlySelf: true, emitEvent: true});

      this.route.queryParams.subscribe(params =>{
        const start = params['start'];
        const end = params['end'];

        const parsedStart = new Date(start);
        const parsedEnd = new Date(end)

        if(!isNaN(parsedStart.getTime())) // Valid date check
          this.eventForm.patchValue({startDateTime: parsedStart});
        if(!isNaN(parsedEnd.getTime())) this.eventForm.patchValue({ endDateTime: parsedEnd});
      });
  }

  get tickets(): FormArray{
    return this.eventForm.get('tickets') as FormArray
  }

  addTicket(){
    this.tickets.push(
      new FormGroup({
          name: new FormControl('',[Validators.required, CustomValidators.noWhitespaceValidator]),
          price: new FormControl('', [Validators.required, Validators.min(0)]),
          description: new FormControl('', CustomValidators.noWhitespaceValidator),
          quota: new FormControl('',[Validators.required,Validators.min(1)]),
          validFrom: new FormControl({value: '', disabled: !(this.eventStart && this.eventEnd)}, Validators.required),
          validUntil: new FormControl({value: '', disabled: !(this.eventStart && this.eventEnd)},Validators.required)

        }, {validators: CustomValidators.startBeforeEndDates('validFrom','validUntil')})
    );

    this.toggleTicketDateControls();
  }

  removeTicket(index: number){
    this.tickets.removeAt(index);
  }

  toggleTicketDateControls() : void {
    const tickets = this.eventForm.get('tickets') as FormArray;
    const enable = this.eventStart !== null && this.eventEnd !== null;

    tickets.controls.forEach(ticketGroup =>{
      const formControl = ticketGroup.get('validFrom');
      const untilControl = ticketGroup.get('validUntil');

      if(enable){
        formControl?.enable({emitEvent: false});
        untilControl?.enable({emitEvent: false});
      }else{
        formControl?.disable({emitEvent: false});
        untilControl?.disable({emitEvent: false});
      }
    });
  }

  onFileSelect(event : any) : void{
    this.selectedImageFile = event.files[0] || null
  }

  onFileClear() : void{
    this.selectedImageFile = null;
  }

  toDisplayName(fieldName : string): string{
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, strr => strr.toUpperCase())
  }

  showValidationErrors()
  {
    const errors: string [] = [];

    Object.keys(this.eventForm.controls).forEach(field =>{
      const control = this.eventForm.get(field);

      if(control instanceof FormArray)
      {
        control.controls.forEach((group: AbstractControl, index: number) => {
          if(group instanceof FormGroup)
          {
            Object.keys(group.controls).forEach(nestedField => {

              const nestedControl = group.get(nestedField);
              if(nestedControl && nestedControl.invalid && nestedControl.errors)
              {
                Object.keys(nestedControl.errors).forEach(errorKey => {

                  let errorMsg = '';
                  switch(errorKey)
                  {
                    case 'required': errorMsg = 'is required'; break;
                    case 'min': errorMsg = `must be at least ${nestedControl.errors![errorKey].min}`; break;
                    case 'whitespace': errorMsg = 'cannot be empty or just spaces'; break;
                    default: errorMsg = errorKey;
                  }

                  errors.push(`*Ticket ${index +1} - ${this.toDisplayName(nestedField)} ${errorMsg}`)
                });
              }

            });

            if(group.errors){
              Object.keys(group.errors).forEach(errorKey => {
                let errorMsg = '';
                switch(errorKey){
                  case 'startBeforeEnd': errorMsg = 'Valid From must be before Valid Until'; break;
                  default: errorMsg = errorKey;
                }
                errors.push(`*Ticket ${index + 1} - ${errorMsg}`)
              });
            }

          }
        });    

        return;
      }

      if(control && control.invalid)
      {
        const fieldErrors = control.errors;
        if(fieldErrors)
        {
          Object.keys(fieldErrors).forEach(errorKey =>{

            let errorMsg = '';

            switch(errorKey)
            {
              case 'required': errorMsg = 'is required'; break;
              case 'min' : errorMsg = `must be at least ${fieldErrors[errorKey].min}`; break;
              case 'max': errorMsg = `must be at most ${fieldErrors[errorKey].max}`; break;
              case 'pastDate': errorMsg = 'cannot be in the past'; break;
              case 'whitespace': errorMsg = 'cannot be empty or just spaces'; break;
              default: errorMsg = errorKey;
            }

            errors.push(`*${this.toDisplayName(field)} - ${errorMsg}`)
          });
        }
      }
    });

    if(this.eventForm.errors){
      Object.keys(this.eventForm.errors).forEach(errorKey =>{
        let errorMsg = '';

        switch(errorKey){
          case 'startBeforeEnd': errorMsg = 'Start Date Time must be before End Date Time'; break;
          default: errorMsg = errorKey;
        }

        errors.push(`*Form - ${errorMsg}`);
      });
    }

    const summary = 'Form fields are not valid:';
    const detail = errors.join('\n')

    this.messageService.add({ severity: 'error', summary, detail, sticky: true })
  }

  submitForm() : void
  {

    if(this.eventForm.invalid) {
      this.showValidationErrors()
      return;
    }
    const formValues = this.eventForm.getRawValue();
    const tickets = formValues.tickets ?? [];

    const ticketDtos = tickets.map(ticket => 
      new TicketDto(
        ticket.name,
        ticket.price,
        ticket.description,
        ticket.quota,
        new Date(ticket.validFrom),
        new Date(ticket.validUntil))
    );
    const capacity = formValues.isUnlimitedCapacity ? -1 : formValues.capacity;

    const eventDto = new CreatEventDto(
      formValues.title,
      formValues.description,
      formValues.location,
      new Date(formValues.startDateTime),
      new Date(formValues.endDateTime),
      capacity,
      '',
      formValues.category,
      ticketDtos
    )

    console.log(eventDto)
    
    // this.apiService.createEvent(eventDto,this.authService.getUserId()).subscribe({
    //   next: (response) =>{
    //     const message = response.headers.get('Location') || 'Event created successfully!';
    //     this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    //   },
    //   error: () => {
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create event.' })
    //   }
    // })

  }
}
