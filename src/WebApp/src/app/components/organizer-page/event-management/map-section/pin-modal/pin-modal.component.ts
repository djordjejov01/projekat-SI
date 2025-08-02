import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { Observable, take } from 'rxjs';
import { ApiService } from '../../../../../Services/api.service';
import { MessageService } from 'primeng/api';
import { IDeactivate } from '../../../../../Interfaces/IDeactivate';
import { ConfirmationDialogService } from '../../../../../Services/confirmation-dialog.service';

@Component({
  selector: 'app-pin-modal',
  imports: [ReactiveFormsModule,DialogModule,FloatLabelModule,ButtonModule,SelectModule,CommonModule,InputTextModule,TextareaModule],
  templateUrl: './pin-modal.component.html',
  styleUrl: './pin-modal.component.css'
})
export class PinModalComponent implements OnInit,IDeactivate{

  @Output() pinSaved = new EventEmitter<EventPinDto>();
  @Input() eventId!: number;
  visible = false;
  pinForm!: FormGroup;
  lat!: number;
  lon!: number;
  editingPin : EventPinDto | null = null;

  pinTypeOptions : any[] = [];

  constructor(
    private formValidationService : FormValidationService,
    private pinCategoryService : PinCategoryService,
    private apiService : ApiService,
    private messageService : MessageService,
    private confirmationDialogService : ConfirmationDialogService) {}


  ngOnInit(): void {

      this.pinForm = new FormGroup({
        title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
        description: new FormControl('', [CustomValidators.noWhitespaceValidator]),
        type: new FormControl('', [Validators.required])
      });
    
  }

  open(lat: number, lon: number, pinToEdit? : EventPinDto){
    this.lat = lat,
    this.lon = lon,
    this.visible = true;

    this.pinCategoryService.loadCategoriesIfEmpty()
    .pipe(take(1))
    .subscribe(categories => {
      this.pinTypeOptions = categories.map(cat => ({
        label: cat.name,
        value: cat.id
      }));
    });

    // then patch values if editing
    if(pinToEdit){
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

  savePin(){
    if(this.pinForm.invalid){
      this.formValidationService.showValidationErrors(this.pinForm,'Pin Form');
      return;
    }

    const {title, type, description} = this.pinForm.value

    const pinToSave = new EventPinDto(
      this.eventId,
      this.lat,
      this.lon,
      title,
      new Date(),
      type,
      description
    )

    if(this.editingPin){
      pinToSave.setId(this.editingPin.getId())

      this.apiService.updateMapPin(pinToSave).subscribe({
        next: (message) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Pin Updated',
              detail: message,
              life: 3000
            });
            this.pinSaved.emit();
            this.cancel();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Update Failed',
              detail: err.message || 'Unknown error',
              life: 3000
            });
          }
      });
    }else {
      this.apiService.createMapPin(pinToSave).subscribe({
        next: (message) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Pin Saved',
            detail: message,
            life: 3000
          });
          this.pinSaved.emit(); // Notify parent to reload pins
          this.cancel();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: err.message || 'Unknown error',
            life: 3000
          });
        }
      });
    }

  }


  cancel(){
    this.pinForm.reset();
    this.editingPin = null;
    this.visible = false;
  }

    async onCancleClick(){
    const canLeave = await this.canExit();
    if(canLeave){
      this.cancel()
    }
  }

  canExit () : boolean | Observable<boolean> | Promise<boolean>{
    
    return (this.pinForm.dirty || this.pinForm.touched) ? this.confirmationDialogService.confirm(
        'You have unsaved changes. Are you sure you want to close the modal?',
            'Unsaved Changes'
      )
    : true;
    
  }
  

}
