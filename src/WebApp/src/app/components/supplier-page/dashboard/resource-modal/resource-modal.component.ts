import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../Validators/custom.validators';
import { FormValidationService } from '../../../../Services/FormValidationService';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { IDeactivate } from '../../../../Interfaces/IDeactivate';
import { Observable } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';
import { RESOURCE_CATEGORIES, ResourceAvailability, ResourceMeasure, ResourceType } from '../../../../MockData/MockResources';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-resource-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,InputNumberModule,SelectModule,ButtonModule,InputText,TextareaModule],
  templateUrl: './resource-modal.component.html',
  styleUrl: './resource-modal.component.css'
})
export class ResourceModalComponent implements OnInit, IDeactivate{

  resourceForm : FormGroup;
  visible : boolean = false;
  categoryOptions: { label: string, value: number }[] = [];
  measureOptions: { label: string; value: ResourceMeasure }[] = [];

  resourceTypeOptions = [
  { label: 'Exhaustible', value: ResourceType.Exhaustable },
  { label: 'Inexhaustible', value: ResourceType.Inexhaustable }
];

resourceAvailabilityOptions = [
  { label: 'Available', value: ResourceAvailability.Available },
  { label: 'Unavailable', value: ResourceAvailability.Unavailable },
  { label: 'Booked', value: ResourceAvailability.Booked }
];



  constructor(private formValidationService : FormValidationService, private confirmationDialogService : ConfirmationDialogService) {}

  ngOnInit(): void {

    this.categoryOptions = Object.entries(RESOURCE_CATEGORIES).map(([key, label]) => ({
      label,
      value: Number(key)
    }));

      // Create measure options from the enum
  this.measureOptions = Object.entries(ResourceMeasure)
    .filter(([key, value]) => !isNaN(Number(value))) // only numeric entries
    .map(([key, value]) => ({
      label: key,           // label shown in dropdown
      value: Number(value)  // numeric value stored
    }));
    
    this.resourceForm = new FormGroup({
      name: new FormControl('',[Validators.required, CustomValidators.noWhitespaceValidator]),
      category: new FormControl('',Validators.required),
      location: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      type: new FormControl('', Validators.required),
      quantity: new FormControl(null,[ Validators.required,Validators.min(0)]),
      measure: new FormControl('',[ Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('',CustomValidators.noWhitespaceValidator)

    })

  }


  openModal(){
    this.visible = true;
  }

  closeModal()
  {
    this.visible = false;
    this.resourceForm.reset();
  }

  async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.closeModal()
    }
  }

  submitForm()
  {
    if(!this.resourceForm.valid)
    {
      this.formValidationService.showValidationErrors(this.resourceForm, 'Resource Form');
      return;
    }

    console.log(this.resourceForm.value)
  }

      canExit () : boolean | Observable<boolean> | Promise<boolean>{
    
        return (this.resourceForm.dirty || this.resourceForm.touched) ? this.confirmationDialogService.confirm(
            'You have unsaved changes. Are you sure you want to close the modal?',
            'Unsaved Changes'
          )
        : true;
    
      }

}
