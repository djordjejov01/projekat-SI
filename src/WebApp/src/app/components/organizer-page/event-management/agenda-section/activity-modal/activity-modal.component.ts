import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-modal',
  imports: [TranslateModule,ReactiveFormsModule,DialogModule,FloatLabelModule,InputTextModule,TextareaModule,DatePickerModule,SelectModule,ButtonModule],
  templateUrl: './activity-modal.component.html',
  styleUrls: ['./activity-modal.component.css']
})
export class ActivityModalComponent implements OnInit, OnChanges, IDeactivate {

  activityForm : FormGroup;
  visible : boolean = false;
  categories: { label: string, value: number }[] = [];
  @Input() parentEventBasicInfo : EventBasicInfo;
  @Output() activityCreated = new EventEmitter<void>();

  constructor(
    private categoryService : CategoryService,
    private formValidationService : FormValidationService,
    private apiService : ApiService,
    private messageService : MessageService,
    private confirmationDialogService : ConfirmationDialogService,
    private translate : TranslateService
  ) {}

  ngOnInit(): void {
    this.categoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories.map(cat => ({
          // prevodimo kategorije
          label: this.translate.instant(`CATEGORYS.${cat.name.toUpperCase()}`),
          value: cat.id
        }));
      });
  
    this.initializeForm()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['parentEventBasicInfo'] && !changes['parentEventBasicInfo'].firstChange) {
      this.initializeForm()
    }
  }

  initializeForm(){
    this.activityForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', CustomValidators.noWhitespaceValidator),
      startTime: new FormControl('',Validators.required),
      endTime: new FormControl('',Validators.required),
      category: new FormControl('',Validators.required)
    }, { validators: CustomValidators.startBeforeEndDates('startTime','endTime') })
  }

  show(){
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.activityForm.reset()
  }

  async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.hide()
    }
  }

  submitForm(){
    if(this.activityForm.invalid){
      this.formValidationService.showValidationErrors(this.activityForm,'Activity Form');
      return;
    }

    const formValue = this.activityForm.value;

    const activity = new ActivityDto(
      this.parentEventBasicInfo.getEventID(),
      formValue.title,
      new Date(formValue.startTime).toISOString(),
      new Date(formValue.endTime).toISOString(),
      formValue.description,
      formValue.category
    )

    this.apiService.createActivity(activity).subscribe({
      next: (response) => {
        const message = response.headers?.get('Location') || this.translate.instant('ACTIVITY.CREATE_SUCCESS');
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: message
        });
        this.hide()
        this.activityCreated.emit()
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  canExit () : boolean | Observable<boolean> | Promise<boolean>{
    return (this.activityForm.dirty || this.activityForm.touched) 
      ? this.confirmationDialogService.confirm(
          this.translate.instant('ACTIVITY.UNSAVED_MESSAGE'),
          this.translate.instant('ACTIVITY.UNSAVED_TITLE')
        )
      : true;
  }
}
