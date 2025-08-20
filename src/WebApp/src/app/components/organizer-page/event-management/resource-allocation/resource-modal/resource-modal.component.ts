// resource-modal.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { PicklistItem } from '../../resource-allocation/resource-allocation.component';
import { ApiService } from '../../../../../Services/api.service'; 
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo'; 
import { MessageService } from 'primeng/api';
import { EventResourceDto } from '../../../../../Models/EventResourceDto'; 
import { SupplierDto } from '../../../../../Models/SupplierDto'; 
import { CustomValidators } from '../../../../../Validators/custom.validators'; 
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { Observable } from 'rxjs';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { FormValidationService } from '../../../../../Services/FormValidationService';

@Component({
  selector: 'app-resource-modal',
  imports: [FormsModule,CheckboxModule,ReactiveFormsModule,DialogModule,ButtonModule,FloatLabelModule,InputTextModule,CommonModule,DatePickerModule,CalendarModule,InputNumberModule],
  templateUrl: './resource-modal.component.html',
  styleUrl: './resource-modal.component.css'
})
export class ResourceModalComponent implements OnInit, IDeactivate {

  @Output() save = new EventEmitter<PicklistItem>();
  @Output() cancel = new EventEmitter<PicklistItem>();
  @Output() onHide = new EventEmitter<void>();

  visible: boolean = false;
  resourceForm: FormGroup;
  selectedResource: PicklistItem;
  selectedSupplier: SupplierDto;
  
  @Input() eventBasicInfo!: EventBasicInfo;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationDialogService : ConfirmationDialogService,
    private formValidationService : FormValidationService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.resourceForm = this.fb.group({
      allocatedQuantity: [null],
      startDateTimeBooked: [null],
      endDateTimeBooked: [null],
      isReservable: [false]
    }, { validators: [CustomValidators.startBeforeEndDates('startDateTimeBooked', 'endDateTimeBooked')] });
  }

  openModal(resource: PicklistItem, supplier: SupplierDto) {
    this.selectedResource = resource;
    this.selectedSupplier = supplier;
    this.visible = true;
    this.resourceForm.reset();
    this.applyConditionalValidators();
  }

private applyConditionalValidators() {
  // Set required and min validators for quantity for both cases
  this.resourceForm.get('allocatedQuantity')?.setValidators([
    Validators.required,
    Validators.min(1),
    // Apply the max validator to ALL resources.
    // The `selectedResource.quantity` should reflect the true maximum available,
    // which for "single-use" inexhaustible resources will be 1 (from backend filtering).
   // Validators.max(this.selectedResource.quantity)
  ]);
  
  if (this.selectedResource.isExhaustable) {
    // For exhaustible resources, date fields are not required.
    this.resourceForm.get('startDateTimeBooked')?.clearValidators();
    this.resourceForm.get('endDateTimeBooked')?.clearValidators();
  } else {
    // For inexhaustible resources, date fields are required for booking.
    this.resourceForm.get('startDateTimeBooked')?.setValidators(Validators.required);
    this.resourceForm.get('endDateTimeBooked')?.setValidators(Validators.required);
  }

  // Update validation status for all form controls
  this.resourceForm.get('allocatedQuantity')?.updateValueAndValidity();
  this.resourceForm.get('startDateTimeBooked')?.updateValueAndValidity();
  this.resourceForm.get('endDateTimeBooked')?.updateValueAndValidity();
}


onSaveClick() {
    if (this.resourceForm.invalid) {
        this.formValidationService.showValidationErrors(this.resourceForm, 'Resource Form');
        return;
    }

    const formValue = this.resourceForm.value;

    // CRITICAL FIX: The quantity check should now apply to ALL resources,
    // as `selectedResource.quantity` correctly reflects the max.
    if (formValue.allocatedQuantity > this.selectedResource.quantity) {
        this.messageService.add({ severity: 'error', summary: 'Quantity Error', detail: `The quantity cannot exceed the available amount (${this.selectedResource.quantity}).`, life: 3000 });
        return;
    }
    
    // Create the DTO instance to send to the backend.
    const newEventResource = new EventResourceDto(
        0, 
        this.selectedResource.supplierID,
        this.eventBasicInfo.getEventID(),
        this.selectedResource.resourceID,
        formValue.allocatedQuantity, 
        !!formValue.isReservable, 
        0, // Status is always Pending for new requests
        formValue.startDateTimeBooked,
        formValue.endDateTimeBooked
    );

    // Call the API service to request the resource.
    this.apiService.requestResource(newEventResource).subscribe({
        next: (response) => {
            // The API call was successful.
            // We no longer expect a DTO in the response.
            // We emit the original resource to the parent component, which will trigger a reload.
            this.save.emit(this.selectedResource);
            this.visible = false;
        },
        error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Allocation Failed', detail: error.message || 'An unexpected error occurred.', life: 3000 });
        }
    });
}


  close() {
    this.cancel.emit(this.selectedResource);
    this.selectedResource = null;
    this.selectedSupplier = null;
    this.resourceForm.reset();
    this.visible = false;
  }

  onDialogHide() {
  this.onHide.emit(); // Emit the onHide event when the dialog closes
}

      async onCancelClick(){
      const canLeave = await this.canExit();
      if(canLeave){
        this.close()
      }
    }
  
    canExit () : boolean | Observable<boolean> | Promise<boolean>{
      
      return (this.resourceForm.dirty || this.resourceForm.touched) ? this.confirmationDialogService.confirm(
          'You have unsaved changes. Are you sure you want to close the modal?',
              'Unsaved Changes'
        )
      : true;
      
    }
}