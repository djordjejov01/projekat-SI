import { Component, EventEmitter, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { CategoryService } from '../../../../../Services/EventCategoryService';
import { Observable, take } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormValidationService } from '../../../../../Services/FormValidationService';
import { EventBasicInfo } from '../../../../../Models/EventBasicInfo';
import { ActivityDto } from '../../../../../Models/ActivityDto';
import { ApiService } from '../../../../../Services/api.service';
import { MessageService } from 'primeng/api';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-activity-modal',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, FloatLabelModule, InputTextModule, TextareaModule, DatePickerModule, SelectModule, ButtonModule, TooltipModule],
  templateUrl: './activity-modal.component.html',
  styleUrl: './activity-modal.component.css'
})
export class ActivityModalComponent implements OnInit, IDeactivate {

  activityForm: FormGroup;
  visible: boolean = false;
  categories: { label: string, value: number }[] = [];
  @Input() parentEventBasicInfo!: EventBasicInfo;
  
  _editMode: boolean = false;
  _existingActivity: ActivityDto | null = null;

  @Output() activityCreated = new EventEmitter<void>();
  @Output() activityUpdated = new EventEmitter<void>();

  // ADDED: ViewChild to get a reference to the p-floatlabel element itself
  @ViewChild('descriptionFloatLabel', { static: false }) descriptionFloatLabel!: ElementRef;


  constructor(
    private categoryService: CategoryService,
    private formValidationService: FormValidationService,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService) {}

  ngOnInit(): void {
    this.categoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories.map(cat => ({
          label: cat.name,
          value: cat.id
        }));
      });
    
    this.initializeForm(); // Initialize form structure on init
  }

  initializeForm() {
    this.activityForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', [CustomValidators.noWhitespaceValidator, Validators.required]),
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required)
    }, { validators: CustomValidators.startBeforeEndDates('startTime','endTime') });
  }

  patchFormWithActivityData(activity: ActivityDto) {
    this.activityForm.patchValue({
      title: activity.getTitle(),
      description: activity.getDescription(),
      startTime: new Date(activity.getStartDate()),
      endTime: new Date(activity.getEndDate()),
      category: activity.getCategory()
    });

  }

  show(): void {
    this._editMode = false;
    this._existingActivity = null;
    this.visible = true;
  }

  showForEdit(activity: ActivityDto): void {
    this._editMode = true;
    this._existingActivity = activity;
    this.patchFormWithActivityData(activity); // This will now handle adding/removing 'p-filled'
    this.visible = true; // Show the modal AFTER patching
  }

  hide() {
    this.visible = false;
    this.activityForm.reset(); // Reset form when hiding
    this._editMode = false;
    this._existingActivity = null;
  }

  async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.hide();
    }
  }

  submitForm() {
    if (this.activityForm.invalid) {
      this.formValidationService.showValidationErrors(this.activityForm, 'Activity Form');
      return;
    }

    const formValue = this.activityForm.value;
    const activityToSave = new ActivityDto(
        this.parentEventBasicInfo.getEventID(),
        formValue.title,
        new Date(formValue.startTime).toISOString(),
        new Date(formValue.endTime).toISOString(),
        formValue.description,
        formValue.category,
        this._editMode && this._existingActivity ? this._existingActivity.getActivityId() : undefined
    );

    if (this._editMode && activityToSave.getActivityId()) {
      this.apiService.updateActivity(activityToSave.getActivityId()!, activityToSave).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: response.message || 'Activity updated successfully!', life: 3000 });
          this.hide();
          this.activityUpdated.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to update activity.', life: 3000 });
        }
      });
    } else {
      this.apiService.createActivity(activityToSave).subscribe({
        next: (response) => {
          const message = response.headers?.get('Location') || 'Activity created successfully!';
          this.messageService.add({ severity: 'success', summary: 'Created', detail: message, life: 3000 });
          this.hide();
          this.activityCreated.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to create activity.', life: 3000 });
        }
      });
    }
  }

  canExit(): boolean | Observable<boolean> | Promise<boolean> {
    return (this.activityForm.dirty || this.activityForm.touched) ? this.confirmationDialogService.confirm(
      'You have unsaved changes. Are you sure you want to close the modal?',
      'Unsaved Changes'
    ) : true;
  }
}
