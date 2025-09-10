import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EventPinDto } from '../../../../../Models/EventPinDto';
import { PinCategoryService } from '../../../../../Services/PinCategoryService';
import { take, Subscription } from 'rxjs';
import { ApiService } from '../../../../../Services/api.service';
import { MessageService } from 'primeng/api';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';
import { DropdownModule } from 'primeng/dropdown';
import { environment } from '../../../../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pin-modal',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    FloatLabelModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    TranslateModule
  ],
  templateUrl: './pin-modal.component.html',
  styleUrls: ['./pin-modal.component.css']
})
export class PinModalComponent implements OnInit, OnDestroy, IDeactivate {

  @Output() pinSaved = new EventEmitter<EventPinDto>();
  @Input() eventId!: number;
  visible = false;
  pinForm!: FormGroup;
  lat!: number;
  lon!: number;
  editingPin: EventPinDto | null = null;

  pinTypeOptions: { label: string, value: number, icon: string }[] = [];
  private languageSubscription!: Subscription;

  constructor(
    private formValidationService: FormValidationService,
    private pinCategoryService: PinCategoryService,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initForm() {
    this.pinForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', [CustomValidators.noWhitespaceValidator]),
      type: new FormControl('', [Validators.required])
    });
  }

  open(lat: number, lon: number, pinToEdit?: EventPinDto) {
    this.lat = lat;
    this.lon = lon;
    this.visible = true;

    this.pinCategoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        // Unsubscribe from the old subscription if it exists
        if (this.languageSubscription) {
          this.languageSubscription.unsubscribe();
        }

        // Create a new subscription to handle language changes for category labels
        this.languageSubscription = this.translate.stream('PIN.TYPES').subscribe(() => {
          this.pinTypeOptions = categories.map(cat => ({
            label: this.translate.instant(`PIN.TYPES.${cat.name.toUpperCase()}`),
            value: cat.id,
            icon: `${environment.backendBaseUrl}/pins/${cat.id}.png`
          }));
        });
      });

    if (pinToEdit) {
      this.pinForm.patchValue({
        title: pinToEdit.getLabel(),
        description: pinToEdit.getDescription(),
        type: pinToEdit.getPinCategory()
      });
      this.editingPin = pinToEdit;
    } else {
      this.editingPin = null;
    }
  }

  savePin() {
    if (this.pinForm.invalid) {
      this.formValidationService.showValidationErrors(
        this.pinForm,
        this.translate.instant('PIN.FORM')
      );
      return;
    }

    const { title, type, description } = this.pinForm.value;

    const pinToSave = new EventPinDto(
      this.eventId,
      this.lat,
      this.lon,
      title,
      new Date(),
      type,
      description
    );

    if (this.editingPin) {
      pinToSave.setId(this.editingPin.getId());

      this.apiService.updateMapPin(pinToSave).subscribe({
        next: (message) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PIN.UPDATED'),
            detail: message,
            life: 3000
          });
          this.pinSaved.emit();
          this.cancel();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('PIN.UPDATE_FAILED'),
            detail: err.message || this.translate.instant('PIN.UNKNOWN_ERROR'),
            life: 3000
          });
        }
      });
    } else {
      this.apiService.createMapPin(pinToSave).subscribe({
        next: (message) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PIN.SAVED'),
            detail: message,
            life: 3000
          });
          this.pinSaved.emit();
          this.cancel();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('PIN.SAVE_FAILED'),
            detail: err.message || this.translate.instant('PIN.UNKNOWN_ERROR'),
            life: 3000
          });
        }
      });
    }
  }

  cancel() {
    this.pinForm.reset();
    this.editingPin = null;
    this.visible = false;
  }

  async onCancleClick() {
    const canLeave = await this.canExit();
    if (canLeave) {
      this.cancel();
    }
  }

  getPinLabelById(id: number): string {
    return this.pinTypeOptions.find(o => o.value === id)?.label || '';
  }

  canExit(): boolean | Promise<boolean> {
    return (this.pinForm.dirty || this.pinForm.touched)
      ? this.confirmationDialogService.confirm(
          this.translate.instant('PIN.UNSAVED_CHANGES'),
          this.translate.instant('PIN.UNSAVED_TITLE')
        )
      : true;
  }
}
