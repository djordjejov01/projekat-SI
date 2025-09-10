import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resource-modal',
  imports: [
    DialogModule,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CommonModule,
    DatePickerModule,
    CalendarModule,
    InputNumberModule,
    TranslateModule
  ],
  templateUrl: './resource-modal.component.html',
  styleUrls: ['./resource-modal.component.css']
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

  resourceTitle: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private formValidationService: FormValidationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.resourceForm = this.fb.group(
      {
        allocatedQuantity: [null],
        startDateTimeBooked: [null],
        endDateTimeBooked: [null],
        isReservable: [false]
      },
      { validators: [CustomValidators.startBeforeEndDates('startDateTimeBooked', 'endDateTimeBooked')] }
    );
  }

  openModal(resource: PicklistItem, supplier: SupplierDto) {
    this.selectedResource = resource;
    this.selectedSupplier = supplier;
    this.visible = true;
    this.resourceForm.reset();
    this.applyConditionalValidators();
    this.updateResourceTitle();
  }

private applyConditionalValidators() {

  const eventStartDate = this.eventBasicInfo.getStartDate();
  const eventEndDate = this.eventBasicInfo.getEndDate();
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
    this.resourceForm.get('startDateTimeBooked')?.setValidators([Validators.required,CustomValidators.dateWithinRange(eventStartDate,eventEndDate)]);
    this.resourceForm.get('endDateTimeBooked')?.setValidators([Validators.required,CustomValidators.dateWithinRange(eventStartDate,eventEndDate)]);
  }
}

  private updateResourceTitle(): void {
    if (!this.selectedResource) {
      this.resourceTitle = '';
      return;
    }

    const typeKey = this.selectedResource.isExhaustable
      ? 'RESOURCE.EXHAUSTABLE'
      : 'RESOURCE.INEXHAUSTABLE';

    const typeTranslated = this.translate.instant(typeKey);

    this.resourceTitle = this.translate.instant('RESOURCE.ALLOCATE_TITLE', {
      name: this.selectedResource.name,
      type: typeTranslated
    });
  }

  onSaveClick() {
    if (this.resourceForm.invalid) {
      this.formValidationService.showValidationErrors(this.resourceForm, this.translate.instant('RESOURCE.FORM'));
      return;
    }

    const formValue = this.resourceForm.value;

    const newEventResource = new EventResourceDto(
      0,
      this.selectedResource.supplierID,
      this.eventBasicInfo.getEventID(),
      this.selectedResource.resourceID,
      formValue.allocatedQuantity,
      !!formValue.isReservable,
      0,
      formValue.startDateTimeBooked,
      formValue.endDateTimeBooked
    );

    this.apiService.requestResource(newEventResource).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('RESOURCE.ALLOCATE_SUCCESS'),
          detail: this.translate.instant('RESOURCE.ALLOCATE_DETAIL'),
          life: 3000
        });
        this.save.emit(this.selectedResource);
        this.visible = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('RESOURCE.ALLOCATE_FAILED'),
          detail: error.message || this.translate.instant('RESOURCE.ALLOCATE_FAILED_DETAIL'),
          life: 3000
        });
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
    this.onHide.emit();
  }

  async onCancelClick() {
    const canLeave = await this.canExit();
    if (canLeave) {
      this.close();
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
