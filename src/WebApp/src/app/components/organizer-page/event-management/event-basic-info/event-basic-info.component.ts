import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../../../Models/Event';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../Validators/custom.validators';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputNumber } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { CategoryService } from '../../../../Services/EventCategoryService';
import { take } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UpdatEventDto } from '../../../../Models/UpdateEventDto';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-event-basic-info',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputNumber,DatePickerModule,SelectModule,ButtonModule,InputTextModule,Checkbox,TextareaModule],
  templateUrl: './event-basic-info.component.html',
  styleUrl: './event-basic-info.component.css'
})
export class EventBasicInfoComponent implements OnInit{

  @Input() event: Event;
  @Input() editMode!: boolean;
  @Output() cancleEdit = new EventEmitter<void>();

    eventForm : FormGroup;
    minDate : Date;
    categories = [];

    constructor(
      private categoryService : CategoryService,
      private messageService : MessageService,
      private apiService : ApiService) {}

    ngOnInit(): void {

      this.minDate = new Date();
      
    this.categoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories.map(cat => ({
          label: cat.name,
          value: cat.id
        }));
      });


      this.eventForm = new FormGroup({
        title: new FormControl(this.event.getTitle(), [Validators.required, CustomValidators.noWhitespaceValidator]),
        description: new FormControl(this.event.getDescription(), CustomValidators.noWhitespaceValidator),
        location: new FormControl(this.event.getLocation(), [Validators.required, CustomValidators.noWhitespaceValidator]),
        isUnlimitedCapacity: new FormControl(this.event.getCapacity() === -1),
        capacity: new FormControl(
          this.event.getCapacity() === -1 ? null : this.event.getCapacity(),
          [Validators.required, Validators.min(1)]
        ),
        startDateTime: new FormControl(this.event.getStartDateTime(), [Validators.required, CustomValidators.notInPast]),
        endDateTime: new FormControl(this.event.getEndDateTime(), Validators.required),
        category: new FormControl(this.event.getCategoryId(), Validators.required),
      }, { validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime') });


      this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited) => {
        const capacityControl = this.eventForm.get('capacity');
        if (unlimited) {
          capacityControl?.disable();
          capacityControl?.clearValidators();
          capacityControl?.setValue(null);
        } else {
          capacityControl?.enable();
          capacityControl?.setValidators([Validators.required, Validators.min(1)]);
          capacityControl?.setValue(this.event.getCapacity() !== -1 ? this.event.getCapacity() : null);
        }
        capacityControl?.updateValueAndValidity();
      });

      this.eventForm.get('isUnlimitedCapacity')?.updateValueAndValidity({onlySelf: true, emitEvent: true});
    }

    toDisplayName(fieldName : string): string{
      return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, strr => strr.toUpperCase())
    }


  showValidationErrors()
  {
    const errors: string [] = [];

    Object.keys(this.eventForm.controls).forEach(field =>{
      const control = this.eventForm.get(field);

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

  submitForm(){

      if(this.eventForm.invalid){
        this.showValidationErrors();
        return;
      }

      const formValues = this.eventForm.value;
        const updateDto = new UpdatEventDto(
          formValues.title,
          formValues.description,
          formValues.location,
          formValues.startDateTime.toISOString(),
          formValues.endDateTime.toISOString(),
          formValues.category,
          formValues.isUnlimitedCapacity ? -1 : formValues.capacity
        );

        console.log(updateDto)

        this.apiService.updateEvent(updateDto, this.event.getEventId()).subscribe({
          next: (data) =>{
            this.event = new Event(
              data.eventID,
              data.organizerID,
              data.title,
              data.category,
              data.description,
              data.location,
              new Date(data.startDate),
              new Date(data.endDate),
              data.numberOfPeople,
              this.event.getOrganizer(),
              data.imageUrl,
              data.isFree,
              data.status
            )

            this.onCancle();

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Event updated successfully.',
              life: 3000
            });
          },
          error: (errorResponse) => {
             this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
          }
        });


  }

  onCancle(){
    this.cancleEdit.emit();

      this.eventForm.reset({
      title: this.event.getTitle(),
      description: this.event.getDescription(),
      location: this.event.getLocation(),
      startDateTime: this.event.getStartDateTime(),
      endDateTime: this.event.getEndDateTime(),
      category: this.event.getCategoryId(),
      capacity: this.event.getCapacity() === -1 ? null : this.event.getCapacity(),
      isUnlimitedCapacity: this.event.getCapacity() === -1
    });

    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
  }

     

}
