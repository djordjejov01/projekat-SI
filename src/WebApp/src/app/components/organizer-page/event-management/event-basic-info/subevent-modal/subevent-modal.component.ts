import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { Event } from '../../../../../Models/Event';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { CategoryService } from '../../../../../Services/EventCategoryService';
import { take } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo';
import { AuthService } from '../../../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../../../Services/api.service';

@Component({
  selector: 'app-subevent-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,InputTextModule,TextareaModule,DatePickerModule,SelectModule,ButtonModule,InputNumber,Checkbox],
  templateUrl: './subevent-modal.component.html',
  styleUrl: './subevent-modal.component.css'
})
export class SubeventModalComponent implements OnInit{


  subeventForm : FormGroup;
  categories = [];
  visible : boolean = false;
  @Input() parentEventBasicInfo! : EventBasicInfo;
  @Output() subeventCreated = new EventEmitter<void>();

  constructor(
    private categoryService : CategoryService,
    private formValidationService : FormValidationService,
    private authService : AuthService,
    private messageService : MessageService,
    private apiService : ApiService) {}

  ngOnInit(): void {
    
    const isParentUnlimited = this.parentEventBasicInfo.getCapacity() === -1;

      this.categoryService.loadCategoriesIfEmpty()
        .pipe(take(1))
        .subscribe(categories => {
          this.categories = categories.map(cat => ({
            label: cat.name,
            value: cat.id
          }));
        });

        this.initializeForm()
  }

  private initializeForm(): void {
  const isParentUnlimited = this.parentEventBasicInfo.getCapacity() === -1;

  this.subeventForm = new FormGroup({
    title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
    description: new FormControl('', CustomValidators.noWhitespaceValidator),
    location: new FormControl(this.parentEventBasicInfo.getLocation(), [Validators.required, CustomValidators.noWhitespaceValidator]),
    isUnlimitedCapacity: new FormControl({ value: isParentUnlimited, disabled: !isParentUnlimited }),
    capacity: new FormControl(isParentUnlimited ? '' : this.parentEventBasicInfo.getCapacity(), isParentUnlimited ? [] : [Validators.required, Validators.min(1)]),
    startDateTime: new FormControl('', [Validators.required, CustomValidators.notInPast]),
    endDateTime: new FormControl('', Validators.required),
    category: new FormControl(this.parentEventBasicInfo.getCategory(), Validators.required),
  }, {
    validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime')
  });
}


  show(){
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.initializeForm()
  }

  submitForm(){

    if(this.subeventForm.invalid){
      this.formValidationService.showValidationErrors(this.subeventForm,'Subevent Form');
      return;
    }

    const formValues = this.subeventForm.getRawValue();
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
      formData.append('ParentEventId', this.parentEventBasicInfo.getEventID().toString())

      const organizerId = this.authService.getUserId();

        this.apiService.createEvent(formData, organizerId).subscribe({
          next: (response) => {
            const message = response.headers?.get('Location') || 'Event created successfully!';
            this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
            this.subeventForm.reset()
            this.hide()
            this.subeventCreated.emit()
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create event.' });
          }
        });
    
  }

}
