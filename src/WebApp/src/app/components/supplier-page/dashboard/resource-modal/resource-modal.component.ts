import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { ResourceDto } from '../../../../Models/ResourceDto';
import { ApiService } from '../../../../Services/api.service';
import { AuthService } from '../../../../Services/auth.service';
import { MessageService } from 'primeng/api';

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
  @Output() resourceAdded = new EventEmitter<ResourceDto>();

  resourceTypeOptions = [
  { label: 'Exhaustible', value: true },
  { label: 'Inexhaustible', value: false }
];



  constructor(
    private formValidationService : FormValidationService,
    private confirmationDialogService : ConfirmationDialogService,
    private resourceAvailabilityService : ResourceAvailabilityService,
    private resourceCategoryService : ResourceCategoryService,
    private apiService : ApiService,
    private authService : AuthService,
    private messageService : MessageService
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
      type: new FormControl('', Validators.required),
      quantity: new FormControl(null,[ Validators.required,Validators.min(0)]),
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

    const formValue = this.resourceForm.value;
    const availability = formValue.type ? (formValue.quantity > 0 ? ResourceAvailability.Available : ResourceAvailability.Unavailable) : ResourceAvailability.Available

    const resourceToAdd = new ResourceDto(
      0,
      formValue.name,
      formValue.category,
      formValue.type,
      availability,
      formValue.description,
      this.authService.getUserId(),
      formValue.quantity
      )


    this.apiService.addResource(resourceToAdd).subscribe({
      next: (addedResource : ResourceDto) => 
      {
        this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Resource Added Successfully!' });
        this.resourceAdded.emit(addedResource)
        this.closeModal()
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

      canExit () : boolean | Observable<boolean> | Promise<boolean>{
    
        return (this.resourceForm.dirty || this.resourceForm.touched) ? this.confirmationDialogService.confirm(
            'You have unsaved changes. Are you sure you want to close the modal?',
            'Unsaved Changes'
          )
        : true;
    
      }

}
