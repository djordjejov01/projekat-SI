import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../Validators/custom.validators';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { CategoryService } from '../../../../../Services/EventCategoryService';
import { take } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormValidationService } from '../../../../../Services/FormValidationService';

@Component({
  selector: 'app-activity-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,InputTextModule,TextareaModule,DatePickerModule,SelectModule,ButtonModule],
  templateUrl: './activity-modal.component.html',
  styleUrl: './activity-modal.component.css'
})
export class ActivityModalComponent implements OnInit{

  activityForm : FormGroup;
  visible : boolean = false;
  categories = [];

  @Input() minDate! : Date;
  @Input() maxDate! : Date;

  constructor(private categoryService : CategoryService, private formValidationService : FormValidationService) {}

  ngOnInit(): void {

      this.categoryService.loadCategoriesIfEmpty()
        .pipe(take(1))
        .subscribe(categories => {
          this.categories = categories.map(cat => ({
            label: cat.name,
            value: cat.id
          }));
        });
    
    this.activityForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('', CustomValidators.noWhitespaceValidator),
      startTime: new FormControl('',Validators.required),
      endTime: new FormControl('',Validators.required),
      category: new FormControl('',Validators.required)
    }, CustomValidators.startBeforeEndDates('startTime','endTime'))

  }

  show(){
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this,this.activityForm.reset()
  }

  submitForm(){

    if(this.activityForm.invalid){
      this.formValidationService.showValidationErrors(this.activityForm,'Activity Form');
    }

    console.log(this.activityForm.value)
  }

}
