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
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';
import { ResourceDto } from '../../../../Models/ResourceDto';
import { RESOURCE_CATEGORIES, ResourceAvailability, ResourceMeasure, ResourceType } from '../../../../MockData/MockResources';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ResourceAvailabilityService } from '../../../../Services/ResourceAvailabilityService';
import { ResourceCategoryService } from '../../../../Services/ResourceCategoryService';
import { ApiService } from '../../../../Services/api.service';
import { AuthService } from '../../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resource-modal',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    DialogModule,
    FloatLabelModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    InputText,
    TextareaModule,
  ],
  templateUrl: './resource-modal.component.html',
  styleUrls: ['./resource-modal.component.css'],
})
export class ResourceModalComponent implements OnInit, IDeactivate {
  resourceForm: FormGroup;
  visible: boolean = false;
  resourceCategoryOptions: { label: string; value: number }[] = [];
  resourceAvailabilityOptions: { label: string; value: number }[] = [];
  @Output() resourceSaved = new EventEmitter<ResourceDto>();
  resourceToEdit: ResourceDto | null = null;

  resourceTypeOptions: { label: string; value: boolean }[] = [];

  constructor(
    private formValidationService: FormValidationService,
    private confirmationDialogService: ConfirmationDialogService,
    private resourceAvailabilityService: ResourceAvailabilityService,
    private resourceCategoryService: ResourceCategoryService,
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Lokalizovani tipovi resursa
    this.resourceTypeOptions = [
      { label: this.translate.instant('RESOURCE.TYPES.EXHAUSTIBLE'), value: true },
      { label: this.translate.instant('RESOURCE.TYPES.INEXHAUSTIBLE'), value: false },
    ];

    this.resourceAvailabilityService
      .loadAvailabilitiesIfEmpty()
      .pipe(take(1))
      .subscribe((availabilities) => {
        this.resourceAvailabilityOptions = availabilities.map((availability) => ({
          label: this.translate.instant(`RESOURCE.AVAILABILITY.${availability.name.toUpperCase()}`),
          value: availability.id,
        }));
      });

    this.resourceCategoryService
      .loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe((categories) => {
        this.resourceCategoryOptions = categories.map((category) => ({
          label: this.translate.instant(`RESOURCE_CATEGORIES.${category.name.toUpperCase()}`),
          value: category.id,
        }));
      });

    this.resourceForm = new FormGroup({
      name: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      category: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      quantity: new FormControl(null, [Validators.required, Validators.min(0)]),
      description: new FormControl('', [CustomValidators.noWhitespaceValidator, Validators.required]),
    });
  }

  openModal(resourceToEdit?: ResourceDto) {
    this.visible = true;

    if (resourceToEdit) {
      this.resourceForm.patchValue({
        name: resourceToEdit.getName(),
        category: resourceToEdit.getCategory(),
        type: resourceToEdit.getIsExhaustable(),
        description: resourceToEdit.getDescription(),
        quantity: resourceToEdit.getQuantity(),
      });

      this.resourceForm.get('type')?.disable();
      this.resourceToEdit = resourceToEdit;
    } else {
      this.resourceForm.reset();
      this.resourceForm.get('type')?.enable();
      this.resourceToEdit = null;
    }
  }

  closeModal() {
    this.visible = false;
    this.resourceForm.reset();
  }

  async onCancleClick() {
    const canLeave = await this.canExit();
    if (canLeave) {
      this.closeModal();
    }
  }

  submitForm() {
    if (!this.resourceForm.valid) {
      this.formValidationService.showValidationErrors(
        this.resourceForm,
        this.translate.instant('RESOURCE.FORM')
      );
      return;
    }

    const formValue = this.resourceForm.getRawValue();
    const availability = formValue.type
      ? formValue.quantity > 0
        ? ResourceAvailability.Available
        : ResourceAvailability.Unavailable
      : ResourceAvailability.Available;

    const resource = new ResourceDto(
      this.resourceToEdit ? this.resourceToEdit.getResourceID() : 0,
      formValue.name,
      formValue.category,
      formValue.type,
      availability,
      formValue.description,
      this.authService.getUserId(),
      formValue.quantity
    );

    if (this.resourceToEdit) {
      this.apiService.editResource(resource).subscribe({
        next: (msg) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS'),
            detail: msg,
            life: 3000,
          });
          this.resourceSaved.emit(null);
          this.closeModal();
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: errorResponse.message,
            life: 3000,
          });
        },
      });
    } else {
      this.apiService.addResource(resource).subscribe({
        next: (addedResource: ResourceDto) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS'),
            detail: this.translate.instant('RESOURCE.ADDED_SUCCESS'),
            life: 3000,
          });
          this.resourceSaved.emit(addedResource);
          this.closeModal();
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: errorResponse.message,
            life: 3000,
          });
        },
      });
    }
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return this.resourceForm.dirty || this.resourceForm.touched
      ? this.confirmationDialogService.confirm(
          this.translate.instant('RESOURCE.UNSAVED_CHANGES'),
          this.translate.instant('RESOURCE.UNSAVED_CHANGES_TITLE')
        )
      : true;
  }
}
