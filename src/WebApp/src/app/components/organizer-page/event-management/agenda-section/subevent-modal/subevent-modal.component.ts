import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { CategoryService } from '../../../../../Services/EventCategoryService';
import { Observable, Subscription, take } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo';
import { AuthService } from '../../../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../../../Services/api.service';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';
import { TooltipModule } from 'primeng/tooltip';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-subevent-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,InputTextModule,TextareaModule,DatePickerModule,SelectModule,ButtonModule,InputNumber,Checkbox,TooltipModule,AutoComplete],
  templateUrl: './subevent-modal.component.html',
  styleUrl: './subevent-modal.component.css'
})
export class SubeventModalComponent implements OnInit,OnDestroy, OnChanges, IDeactivate{


  subeventForm : FormGroup;
  categories = [];
  visible : boolean = false;
  @Input() parentEventBasicInfo! : EventBasicInfo;
  @Output() subeventCreated = new EventEmitter<void>();
  filteredLocations: any[] = [];

  private unlimitedSub: Subscription | undefined;

  constructor(
    private categoryService : CategoryService,
    private formValidationService : FormValidationService,
    private authService : AuthService,
    private messageService : MessageService,
    private apiService : ApiService,
    private confirmationDialogService : ConfirmationDialogService) {}

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

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['parentEventBasicInfo'] && !changes['parentEventBasicInfo'].firstChange) this.initializeForm();
  }

  ngOnDestroy(): void {
    this.unlimitedSub?.unsubscribe();
  }

  private initializeForm(): void {
    const isParentUnlimited = this.parentEventBasicInfo.getCapacity() === -1;
    const capacityValue = isParentUnlimited ? null : this.parentEventBasicInfo.getCapacity();

    const eventStartDate = this.parentEventBasicInfo.getStartDate();
    const eventEndDate = this.parentEventBasicInfo.getEndDate();

     this.subeventForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', [CustomValidators.noWhitespaceValidator,Validators.required]),
      location: new FormControl(this.parentEventBasicInfo.getLocation(), [Validators.required, CustomValidators.noWhitespaceValidator]),
      isUnlimitedCapacity: new FormControl({ value: isParentUnlimited, disabled: !isParentUnlimited }),
      capacity: new FormControl({value : capacityValue, disabled: isParentUnlimited} ,[Validators.required, Validators.min(1)]),
      startDateTime: new FormControl('', [Validators.required, CustomValidators.notInPast,CustomValidators.dateWithinRange(eventStartDate,eventEndDate)]),
      endDateTime: new FormControl('', [Validators.required,CustomValidators.dateWithinRange(eventStartDate,eventEndDate)]),
      category: new FormControl(this.parentEventBasicInfo.getCategory(), Validators.required),
    }, {
      validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime')
    });

    if(isParentUnlimited){

      if(this.unlimitedSub) this.unlimitedSub.unsubscribe();

      const capacityControl = this.subeventForm.get('capacity');
      capacityControl?.disable();
      capacityControl?.clearValidators();
      capacityControl?.updateValueAndValidity();

        this.unlimitedSub = this.subeventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited)=>{

        
        if(unlimited){
          capacityControl?.disable();
          capacityControl?.clearValidators();
          capacityControl?.setValue(null);
        }else{
          capacityControl?.enable()
          capacityControl?.setValidators([Validators.required,Validators.min(1)]);
          
        }

        capacityControl.updateValueAndValidity();
      });
    }else{
      this.subeventForm.get('capacity')?.setValue(this.parentEventBasicInfo.getCapacity());
    }
}

  searchLocations(event: any){
      const query = event.query.trim();
      if(!query) return;

      this.apiService.searchLocations(query).subscribe((results) => {
        this.filteredLocations = results
      })

    }

    onLocationSelect(event: any) {
      const location = event.value;
      this.subeventForm.patchValue({ location: location.display_name });
      //console.log(this.subeventForm.get('location')?.value);
    }




  show(){
    this.initializeForm();
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.unlimitedSub?.unsubscribe();
    this.subeventForm.reset()
  }

  async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.hide()
    }
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
            this.subeventForm.reset()
            this.hide()
            this.subeventCreated.emit()
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create event.', life: 3000 });
          }
        });
    
  }

    canExit () : boolean | Observable<boolean> | Promise<boolean>{
  
      return (this.subeventForm.dirty || this.subeventForm.touched) ? this.confirmationDialogService.confirm(
          'You have unsaved changes. Are you sure you want to close the modal?',
          'Unsaved Changes'
        )
      : true;
  
    }

}
