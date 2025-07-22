import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { SelectModule } from 'primeng/select';
import { IDeactivate } from '../../../Interfaces/IDeactivate';
import { Observable, take } from 'rxjs';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { CategoryService } from '../../../Services/EventCategoryService';


@Component({
  selector: 'app-create-event',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputTextModule,Checkbox,TextareaModule,DatePickerModule,InputNumber,ButtonModule,FileUpload,SelectModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent implements OnInit,IDeactivate{

  eventForm : FormGroup;
  currencyCode : string;
  localeCode : string;
  minDate : Date;
  selectedImageFile: File | null = null;
  categories = [];

  eventStart: Date | null = null;
  eventEnd: Date | null = null;

  @ViewChild('fileUpload') fileUpload: FileUpload | undefined;

  constructor( 
    private translateService : TranslateService,
    private messageService : MessageService,
    private route : ActivatedRoute,
    private apiService : ApiService,
    private authService : AuthService,
    private confirmationDialogService : ConfirmationDialogService,
    private categoryService : CategoryService) {}

  ngOnInit(): void {

    this.minDate = new Date();

    this.categoryService.getCategories()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories.map(cat => ({
          label: cat.name,
          value: cat.id
        }));
      });

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

        if(!isNaN(parsedStart.getTime())){ // Valid date check
          this.eventForm.patchValue({startDateTime: parsedStart});
          this.eventForm.markAsDirty()
        }

        if(!isNaN(parsedEnd.getTime())){
          this.eventForm.patchValue({ endDateTime: parsedEnd});
          this.eventForm.markAsDirty()
        }
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

submitForm(): void {
  if (this.eventForm.invalid) {
    this.showValidationErrors();
    return;
  }

  const formValues = this.eventForm.getRawValue();
  const tickets = formValues.tickets ?? [];
  const capacity = formValues.isUnlimitedCapacity ? -1 : formValues.capacity;

  const formData = new FormData();

  formData.append('Title', formValues.title);
  formData.append('Description', formValues.description);
  formData.append('Location', formValues.location);
  formData.append('StartDateTime', new Date(formValues.startDateTime).toISOString());
  formData.append('EndDateTime', new Date(formValues.endDateTime).toISOString());
  formData.append('Capacity', capacity.toString());

  // Assuming Category is a string or enum, convert it accordingly
  formData.append('Category', formValues.category.toString());

  if (this.selectedImageFile) {
    formData.append('ImageFile', this.selectedImageFile);
  }

  tickets.forEach((ticket, index) => {
    formData.append(`Tickets[${index}].Name`, ticket.name);
    formData.append(`Tickets[${index}].Price`, ticket.price.toString());
    formData.append(`Tickets[${index}].ValidFrom`, new Date(ticket.validFrom).toISOString());
    formData.append(`Tickets[${index}].ValidUntil`, new Date(ticket.validUntil).toISOString());
    formData.append(`Tickets[${index}].Quota`, ticket.quota.toString());
    formData.append(`Tickets[${index}].Description`, ticket.description);
  });

  for (const pair of formData.entries()) {
  console.log(pair[0]+ ': ' + pair[1]);
}

  const organizerId = this.authService.getUserId();

  this.apiService.createEvent(formData, organizerId).subscribe({
    next: (response) => {
      const message = response.headers?.get('Location') || 'Event created successfully!';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: message });

      this.eventForm.reset();
      this.selectedImageFile = null; // Reset the image file after successful submission
      this.eventForm.get('isUnlimitedCapacity')?.setValue(false);
      this.fileUpload?.clear(); // Clear the file upload component

      const ticketsArray = this.eventForm.get('tickets') as FormArray;
      while (ticketsArray.length > 0) {
        ticketsArray.removeAt(0);
      }

      ticketsArray.push(new FormGroup({
        name: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
        price: new FormControl('', [Validators.required, Validators.min(0)]),
        description: new FormControl('', CustomValidators.noWhitespaceValidator),
        quota: new FormControl('', [Validators.required, Validators.min(1)]),
        validFrom: new FormControl({ value: '', disabled: true }, Validators.required),
        validUntil: new FormControl({ value: '', disabled: true }, Validators.required)
      }, { validators: CustomValidators.startBeforeEndDates('validFrom', 'validUntil') }));

    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create event.' });
    }
  });
}

  canExit(): boolean | Observable<boolean> | Promise<boolean>{

    if(this.authService.isLoggingOut()) return true;

    const formDirty = this.eventForm?.dirty;
    const hasImage = !!this.selectedImageFile;

    const shouldWarn = formDirty || hasImage;

    return shouldWarn ? this.confirmationDialogService.confirm('You have unsaved changes. Are you sure you want to leave this page?', 'Unsaved Changes') : true
  }

}
