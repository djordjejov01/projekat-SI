import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { mockAgenda, Subevent } from '../../../../MockData/MockAgenda';
import { AccordionModule } from 'primeng/accordion';
import { FileUpload } from 'primeng/fileupload';
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { FormValidationService } from '../../../../Services/FormValidationService';
import { SubeventModalComponent } from './subevent-modal/subevent-modal.component';

@Component({
  selector: 'app-event-basic-info',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputNumber,DatePickerModule,SelectModule,ButtonModule,InputTextModule,Checkbox,TextareaModule,AccordionModule,FileUpload,ActivityModalComponent,SubeventModalComponent],
  templateUrl: './event-basic-info.component.html',
  styleUrl: './event-basic-info.component.css'
})
export class EventBasicInfoComponent implements OnInit{

  @Input() event: Event;
  @Input() editMode!: boolean;
  @Output() cancleEdit = new EventEmitter<void>();
  @ViewChild('fileUploader') fileUploader: any;

  eventForm : FormGroup;
  minDate : Date;
  categories = [];
  agenda : Subevent[] = [];

    constructor(
      private categoryService : CategoryService,
      private messageService : MessageService,
      private apiService : ApiService,
      private formValidationService : FormValidationService) {}

    ngOnInit(): void {

      this.minDate = new Date();
      this.agenda = mockAgenda;
        
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


  submitForm(){

      if(this.eventForm.invalid){
        this.formValidationService.showValidationErrors(this.eventForm, 'Edit Form');
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

  triggerFileInput(){
    const nativeInput = this.fileUploader?.el?.nativeElement?.querySelector('input[type="file"]');

    if(nativeInput) nativeInput.click();
    else console.warn('File input element not found');
  }

  onImageUpload(event : any){
    console.log("CALLING CHANGE IMAGE");
    const file: File = event.files[0];

    if(!file) return;
    const formData = new FormData();
    formData.append('Image', file);
    formData.append('Id', this.event.getEventId().toString());

    this.apiService.changeEventPicture(formData).subscribe({
      next: (response : { imageUrl: string }) =>{
        this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Image changed successfully.',
              life: 3000
            });
        this.event.setImage(response.imageUrl);
      },
      error: (errorResponse) =>{
              this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
      }
    });
  }

}
