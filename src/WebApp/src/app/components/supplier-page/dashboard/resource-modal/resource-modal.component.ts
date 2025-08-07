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
import { Observable, take } from 'rxjs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';
import { RESOURCE_CATEGORIES, ResourceAvailability, ResourceMeasure, ResourceType } from '../../../../MockData/MockResources';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ResourceAvailabilityService } from '../../../../Services/ResourceAvailabilityService';
import { ResourceCategoryService } from '../../../../Services/ResourceCategoryService';

@Component({
  selector: 'app-resource-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,InputNumberModule,SelectModule,ButtonModule,InputText,TextareaModule],
  templateUrl: './resource-modal.component.html',
  styleUrl: './resource-modal.component.css'
})
export class ResourceModalComponent implements OnInit, IDeactivate{

  resourceForm : FormGroup;
  visible : boolean = false;
  resourceCategoryOptions: { label: string, value: number }[] = [];
  resourceAvailabilityOptions : { label: string; value: number }[] = []

  resourceTypeOptions = [
  { label: 'Exhaustible', value: ResourceType.Exhaustable },
  { label: 'Inexhaustible', value: ResourceType.Inexhaustable }
];



  constructor(private formValidationService : FormValidationService,
    private confirmationDialogService : ConfirmationDialogService,
    private resourceAvailabilityService : ResourceAvailabilityService,
    private resourceCategoryService : ResourceCategoryService,
    ) {}

  ngOnInit(): void {

    this.resourceAvailabilityService.loadAvailabilitiesIfEmpty()
    .pipe(take(1))
    .subscribe(availabilities => {
      this.resourceAvailabilityOptions = availabilities.map(availability => ({
        label: availability.name,
        value: availability.id
      }));
    });

    this.resourceCategoryService.loadCategoriesIfEmpty()
    .pipe(take(1))
    .subscribe(categories => {
      this.resourceCategoryOptions = categories.map(category => ({
        label: category.name,
        value: category.id
      }));
    });
    
    
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
