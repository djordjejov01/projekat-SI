import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(private messageService: MessageService) {}

  showValidationErrors(form: FormGroup, formName: string = 'Form') {
  const errors: string[] = [];

  Object.keys(form.controls).forEach(field => {
    const control = form.get(field);

    if (control instanceof FormArray) {
      control.controls.forEach((group: AbstractControl, index: number) => {
        if (group instanceof FormGroup) {
          const itemLabel = formName === 'Create Event' ? 'Ticket' : formName;

          // Field-level errors inside FormGroup
          Object.keys(group.controls).forEach(nestedField => {
            const nestedControl = group.get(nestedField);
            if (nestedControl && nestedControl.invalid && nestedControl.errors) {
              Object.keys(nestedControl.errors).forEach(errorKey => {
                const errorMsg = this.getErrorMessage(errorKey, nestedControl.errors![errorKey]);
                errors.push(`*${itemLabel} ${index + 1} - ${this.toDisplayName(nestedField)} ${errorMsg}`);
              });
            }
          });

          // Group-level errors
          if (group.errors) {
            Object.keys(group.errors).forEach(errorKey => {
              const errorMsg = this.getErrorMessage(errorKey, group.errors![errorKey]);
              errors.push(`*${itemLabel} ${index + 1} - ${errorMsg}`);
            });
          }
        }
      });

      return;
    }

    // Single field (non-array) errors
    if (control && control.invalid && control.errors) {
      Object.keys(control.errors).forEach(errorKey => {
        const errorMsg = this.getErrorMessage(errorKey, control.errors![errorKey]);
        errors.push(`*${this.toDisplayName(field)} - ${errorMsg}`);
      });
    }
  });

  // Top-level form group errors (e.g. cross-field validations like start < end)
  if (form.errors) {
    Object.keys(form.errors).forEach(errorKey => {
      const errorMsg = this.getErrorMessage(errorKey, form.errors![errorKey]);
      errors.push(`*Form - ${errorMsg}`);
    });
  }

  const summary = 'Form fields are not valid:';
  const detail = errors.join('\n');

  this.messageService.add({ severity: 'error', summary, detail, sticky: true, life: 3000 });
}


  private getErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required': return 'is required';
      case 'min': return `must be at least ${errorValue.min}`;
      case 'max': return `must be at most ${errorValue.max}`;
      case 'whitespace': return 'cannot be empty or just spaces';
      case 'pastDate': return 'cannot be in the past';
      case 'startBeforeEnd': return 'start time must be before end time';
      default: return errorKey;
    }
  }

  private toDisplayName(fieldName : string): string{
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, strr => strr.toUpperCase())
  }
}
