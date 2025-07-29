import { Component, EventEmitter, Output } from '@angular/core';
import { PinDataDto, PinTypeMap } from '../../../../../Models/PinDataDto';
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

@Component({
  selector: 'app-pin-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,ButtonModule,SelectModule,CommonModule,InputTextModule,TextareaModule],
  templateUrl: './pin-modal.component.html',
  styleUrl: './pin-modal.component.css'
})
export class PinModalComponent {

  @Output() pinSaved = new EventEmitter<PinDataDto>();
  visible = false;
  pinForm!: FormGroup;
  lat!: number;
  lon!: number;

  pinTypeOptions : any;

  constructor(private formValidationService : FormValidationService) {}


  open(lat: number, lon: number){
    this.lat = lat,
    this.lon = lon,
    this.visible = true;

    this.pinTypeOptions = Object.entries(PinTypeMap).map(([value, label]) => ({
      label,
      value: +value // convert string key to number
    }));


    this.pinForm = new FormGroup({
      title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
      description: new FormControl('',[CustomValidators.noWhitespaceValidator]),
      type: new FormControl('', [Validators.required])
    })
  }

  savePin(){
    if(this.pinForm.invalid){
      this.formValidationService.showValidationErrors(this.pinForm,'Pin Form');
      return;
    }

    const {title, type, description} = this.pinForm.value

    this.pinSaved.emit(
      new PinDataDto(
        this.lat,
        this.lon,
        title,
        type,
        new Date(),
        description
      )
    )

    this.cancel()

  }

  cancel(){
    this.visible = false;
    this.pinForm.reset();
  }
  

}
