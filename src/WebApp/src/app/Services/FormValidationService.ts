import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  showValidationErrors(form: FormGroup, formName: string = 'Form') {
    const errors: string[] = [];

    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);

      if (control instanceof FormArray) {
        control.controls.forEach((group: AbstractControl, index: number) => {
          if (group instanceof FormGroup) {
            const itemLabel = formName === 'Create Event'
              ? this.translate.instant('FORM_ERRORS.TICKET')
              : this.translate.instant(formName);

            // Field-level errors inside FormGroup
            Object.keys(group.controls).forEach(nestedField => {
              const nestedControl = group.get(nestedField);
              if (nestedControl && nestedControl.invalid && nestedControl.errors) {
                Object.keys(nestedControl.errors).forEach(errorKey => {
                  const errorMsg = this.getErrorMessage(errorKey, nestedControl.errors![errorKey]);
                  errors.push(
                    `*${itemLabel} ${index + 1} - ${this.toDisplayName(nestedField)} ${errorMsg}`
                  );
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
        errors.push(`*${this.translate.instant('FORM_ERRORS.FORM')} - ${errorMsg}`);
      });
    }

    const summary = this.translate.instant('FORM_ERRORS.SUMMARY');
    const detail = errors.join('\n');

    this.messageService.add({ severity: 'error', summary, detail, life: 3000 });
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required': return this.translate.instant('FORM_ERRORS.REQUIRED');
      case 'min': return this.translate.instant('FORM_ERRORS.MIN', { value: errorValue.min });
      case 'max': return this.translate.instant('FORM_ERRORS.MAX', { value: errorValue.max });
      case 'whitespace': return this.translate.instant('FORM_ERRORS.WHITESPACE');
      case 'pastDate': return this.translate.instant('FORM_ERRORS.PAST_DATE');
      case 'startBeforeEnd': return this.translate.instant('FORM_ERRORS.START_BEFORE_END');
      case 'dateOutOfRange': return this.translate.instant('FORM_ERRORS.DATE_OUT_OF_RANGE');
      default: return errorKey;
    }
  }

  private toDisplayName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, strr => strr.toUpperCase());
  }
}
