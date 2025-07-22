import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryMap, Event } from '../../../../Models/Event';
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

@Component({
  selector: 'app-event-basic-info',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputNumber,DatePickerModule,SelectModule,ButtonModule,InputTextModule,Checkbox,TextareaModule],
  templateUrl: './event-basic-info.component.html',
  styleUrl: './event-basic-info.component.css'
})
export class EventBasicInfoComponent implements OnInit{

  @Input() event: Event;
  @Input() editMode!: boolean;
  @Output() cancleEdit = new EventEmitter<void>();

    eventForm : FormGroup;
    minDate : Date;
    categories = [];

    ngOnInit(): void {

      this.minDate = new Date();
      
      this.categories = Object.entries(CategoryMap).map(([key,label]) => ({
        label,
        value: +key
      }))


      this.eventForm = new FormGroup({
        title: new FormControl(this.event.getTitle(), [Validators.required, CustomValidators.noWhitespaceValidator]),
        description: new FormControl(this.event.getDescription(), CustomValidators.noWhitespaceValidator),
        location: new FormControl(this.event.getLocation(), [Validators.required, CustomValidators.noWhitespaceValidator]),
        isUnlimitedCapacity: new FormControl(this.event.getCapacity() === -1),
        capacity: new FormControl(
          this.event.getCapacity() === -1 ? null : this.event.getCapacity(),
          [Validators.required, Validators.min(1)]
        ),
        startDateTime: new FormControl(this.event.getStartDateTime(), [Validators.required, CustomValidators.notInPast]),
        endDateTime: new FormControl(this.event.getEndDateTime(), Validators.required),
        category: new FormControl(this.event.getCategory(), Validators.required),
      }, { validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime') });


      this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited) => {
        const capacityControl = this.eventForm.get('capacity');
        if (unlimited) {
          capacityControl?.disable();
          capacityControl?.clearValidators();
          capacityControl?.setValue(null);
        } else {
          capacityControl?.enable();
          capacityControl?.setValidators([Validators.required, Validators.min(1)]);
          capacityControl?.setValue(this.event.getCapacity() !== -1 ? this.event.getCapacity() : null);
        }
        capacityControl?.updateValueAndValidity();
      });

      this.eventForm.get('isUnlimitedCapacity')?.updateValueAndValidity({onlySelf: true, emitEvent: true});
    }

    onCancle(){
      this.cancleEdit.emit();
    }

     

}
