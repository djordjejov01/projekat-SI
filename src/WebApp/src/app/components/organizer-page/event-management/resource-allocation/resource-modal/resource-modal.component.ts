import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ResourceDto } from '../../../../../Models/ResourceDto';
import { SupplierDto } from '../../../../../Models/SupplierDto';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { Observable } from 'rxjs';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { Checkbox } from 'primeng/checkbox';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { CustomValidators } from '../../../../../Validators/custom.validators';

@Component({
  selector: 'app-resource-modal',
  imports: [FormsModule,CheckboxModule,ReactiveFormsModule,DialogModule,ButtonModule,FloatLabelModule,InputTextModule,CommonModule,DatePickerModule,Checkbox],
  templateUrl: './resource-modal.component.html',
  styleUrl: './resource-modal.component.css'
})
export class ResourceModalComponent implements IDeactivate{

  resource: ResourceDto | null = null;
  supplier: SupplierDto | null = null;
 
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<ResourceDto>();
  @Output() onHide = new EventEmitter<void>(); // Add this new output event

  resourceForm : FormGroup;
  visible : boolean = false;

  constructor(private fb: FormBuilder, private confirmationDialogService : ConfirmationDialogService, private formValidationService : FormValidationService) {}

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['resource'] && this.resource) {
  //     this.buildForm();
  //   }
  // }

  openModal(resource : ResourceDto, supplier : SupplierDto)
  {
    this.resource = resource;
    this.supplier = supplier;
    this.visible = true;
    this.buildForm();
  }

buildForm() {
  this.resourceForm = new FormGroup({
    reservable: new FormControl(false),
    quantity: new FormControl(null),
    dateFrom: new FormControl(null),
    dateTo: new FormControl(null),
  },CustomValidators.startBeforeEndDates('dateFrom','dateTo'));

  if (this.resource.getIsExhaustable()) {
    this.resourceForm.get('quantity')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.resource.getQuantity()),
    ]);
    this.resourceForm.get('dateFrom')?.clearValidators();
    this.resourceForm.get('dateTo')?.clearValidators();
  } else {
    this.resourceForm.get('dateFrom')?.setValidators(Validators.required);
    this.resourceForm.get('dateTo')?.setValidators(Validators.required);
    this.resourceForm.get('quantity')?.clearValidators();
  }

  this.resourceForm.get('quantity')?.updateValueAndValidity();
  this.resourceForm.get('dateFrom')?.updateValueAndValidity();
  this.resourceForm.get('dateTo')?.updateValueAndValidity();
}

onSaveClick() {
  if (this.resourceForm.valid) {
    console.log(this.resourceForm.value)
    this.save.emit(this.resource);
    this.resource = null;
    this.supplier = null;
    this.resourceForm.reset();
    this.visible = false;  
  }

  else this.formValidationService.showValidationErrors(this.resourceForm,'Resource Form');
}


  close() {
    this.cancel.emit(this.resource);
    this.resource = null;
    this.supplier = null;
    this.resourceForm.reset();
    this.visible = false;
  }

  onDialogHide() {
  this.onHide.emit(); // Emit the onHide event when the dialog closes
}
  
      async onCancleClick(){
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
