import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../Validators/custom.validators';
import { ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputNumber } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { CategoryService } from '../../../../Services/EventCategoryService';
import { Subscription, take } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UpdateEventDto } from '../../../../Models/UpdateEventDto';
import { ApiService } from '../../../../Services/api.service';
import { FileUpload } from 'primeng/fileupload';
import { FormValidationService } from '../../../../Services/FormValidationService';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ActivatedRoute } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AutoComplete } from 'primeng/autocomplete';
import { TranslateModule,TranslateService } from '@ngx-translate/core'; // dodato

@Component({
  selector: 'app-event-basic-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputNumber,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    Checkbox,
    TextareaModule,
    FileUpload,
    TooltipModule,
    AutoComplete,
    TranslateModule
  ],
  templateUrl: './event-basic-info.component.html',
  styleUrls: ['./event-basic-info.component.css']
})
export class EventBasicInfoComponent implements OnInit, OnChanges, OnDestroy {

  @Input() eventBasicInfo: EventBasicInfo;
  @Input() editMode!: boolean;
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() eventUpdated = new EventEmitter<EventBasicInfo>();
  @ViewChild('fileUploader') fileUploader: any;

  eventForm: FormGroup;
  minDate: Date;
  categories: { label: string, value: number }[] = [];
  filteredLocations: any[] = [];

  private unlimitedCapacitySub?: Subscription;

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private apiService: ApiService,
    private formValidationService: FormValidationService,
    private route: ActivatedRoute,
    private translate: TranslateService // dodato
  ) {}

  ngOnInit(): void {
    this.minDate = new Date();

    this.categoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories.map(cat => ({
          label: cat.name,
          value: cat.id
        }));
      });

    this.initFormWithEvent()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventBasicInfo'] && changes['eventBasicInfo'].currentValue) {
      this.initFormWithEvent();
    }
  }

  ngOnDestroy(): void {
    this.unlimitedCapacitySub?.unsubscribe();
  }

  initFormWithEvent() {
    this.eventForm = new FormGroup({
      title: new FormControl(this.eventBasicInfo.getTitle(), [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl(this.eventBasicInfo.getDescription(), CustomValidators.noWhitespaceValidator),
      location: new FormControl(this.eventBasicInfo.getLocation(), [Validators.required, CustomValidators.noWhitespaceValidator]),
      isUnlimitedCapacity: new FormControl(this.eventBasicInfo.getCapacity() === -1),
      capacity: new FormControl(
        this.eventBasicInfo.getCapacity() === -1 ? null : this.eventBasicInfo.getCapacity(),
        [Validators.required, Validators.min(1)]
      ),
      startDateTime: new FormControl(this.eventBasicInfo.getStartDate(), [Validators.required, CustomValidators.notInPast]),
      endDateTime: new FormControl(this.eventBasicInfo.getEndDate(), Validators.required),
      category: new FormControl(this.eventBasicInfo.getCategory(), Validators.required),
    }, { validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime') });

    if (this.unlimitedCapacitySub) this.unlimitedCapacitySub.unsubscribe();

    this.unlimitedCapacitySub = this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited) => {
      const capacityControl = this.eventForm.get('capacity');
      if (unlimited) {
        capacityControl?.disable();
        capacityControl?.clearValidators();
        capacityControl?.setValue(null);
      } else {
        capacityControl?.enable();
        capacityControl?.setValidators([Validators.required, Validators.min(1)]);
        capacityControl?.setValue(this.eventBasicInfo.getCapacity() !== -1 ? this.eventBasicInfo.getCapacity() : null);
      }
      capacityControl?.updateValueAndValidity();
    });

    this.eventForm.get('isUnlimitedCapacity')?.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }

  searchLocations(event: any) {
    const query = event.query.trim();
    if (!query) return;

    this.apiService.searchLocations(query).subscribe((results) => {
      this.filteredLocations = results
    })
  }

  onLocationSelect(event: any) {
    const location = event.value;
    this.eventForm.patchValue({ location: location.display_name });
  }

  submitForm() {
    if (this.eventForm.invalid) {
      this.formValidationService.showValidationErrors(this.eventForm, this.translate.instant('EVENT.EDIT_TITLE'));
      return;
    }

    const formValues = this.eventForm.value;
    const updateDto = new UpdateEventDto(
      this.eventBasicInfo.getEventID(),
      formValues.title,
      formValues.description,
      formValues.location,
      formValues.startDateTime.toISOString(),
      formValues.endDateTime.toISOString(),
      formValues.category,
      formValues.isUnlimitedCapacity ? -1 : formValues.capacity
    );

    this.apiService.updateEvent(updateDto).subscribe({
      next: (data) => {
        this.eventBasicInfo = new EventBasicInfo(
          data.eventID,
          data.title,
          data.description,
          data.location,
          new Date(data.startDate),
          new Date(data.endDate),
          data.category,
          data.numberOfPeople,
          this.eventBasicInfo.getAttendingCount(),
          data.imageUrl,
          data.status,
          data.parentEventId
        )
        this.eventUpdated.emit(this.eventBasicInfo);
        this.onCancel();

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('EVENT.UPDATED'),
          life: 3000
        });
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  onCancel() {
    this.cancelEdit.emit();

    this.eventForm.reset({
      title: this.eventBasicInfo.getTitle(),
      description: this.eventBasicInfo.getDescription(),
      location: this.eventBasicInfo.getLocation(),
      startDateTime: this.eventBasicInfo.getStartDate(),
      endDateTime: this.eventBasicInfo.getEndDate(),
      category: this.eventBasicInfo.getCategory(),
      capacity: this.eventBasicInfo.getCapacity() === -1 ? null : this.eventBasicInfo.getCapacity(),
      isUnlimitedCapacity: this.eventBasicInfo.getCapacity() === -1
    });

    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
  }

  triggerFileInput() {
    const nativeInput = this.fileUploader?.el?.nativeElement?.querySelector('input[type="file"]');
    if (nativeInput) nativeInput.click();
    else console.warn('File input element not found');
  }

  onImageUpload(event: any) {
    const file: File = event.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('Image', file);
    formData.append('Id', this.eventBasicInfo.getEventID().toString());

    this.apiService.changeEventPicture(formData).subscribe({
      next: (response: { imageUrl: string }) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('EVENT.IMAGE_CHANGED'),
          life: 3000
        });
        this.eventBasicInfo.setImage(response.imageUrl);
        this.eventUpdated.emit(this.eventBasicInfo);
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }
}
