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
    const translatedFormName = this.translate.instant(formName);

    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);

      if (control instanceof FormArray) {
        control.controls.forEach((group: AbstractControl, index: number) => {
          if (group instanceof FormGroup) {
            const itemLabel = translatedFormName === 'Create Event'
              ? this.translate.instant('FORM_ERRORS.TICKET')
              : translatedFormName;

            // Field-level errors inside FormGroup
            Object.keys(group.controls).forEach(nestedField => {
              const nestedControl = group.get(nestedField);
              if (nestedControl && nestedControl.invalid && nestedControl.errors) {
                Object.keys(nestedControl.errors).forEach(errorKey => {
                  const errorMsg = this.getErrorMessage(errorKey, nestedControl.errors![errorKey]);
                  const translatedField = this.toDisplayName(nestedField);
                  errors.push(
                    `*${itemLabel} ${index + 1} - ${translatedField} ${errorMsg}`
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
          const translatedField = this.toDisplayName(field);
          errors.push(`*${translatedField} - ${errorMsg}`);
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
      case 'capacityExceedsParent': return this.translate.instant('FORM_ERRORS.CAPACITY_EXCEEDS_PARENT');
      case 'quotaExceedsEventCapacity': return this.translate.instant('FORM_ERRORS.QUOTA_EXCEEDS_EVENT_CAPACITY');
      case 'totalQuotaExceedsCapacity': return this.translate.instant('FORM_ERRORS.TOTAL_QUOTA_EXCEEDS_CAPACITY');
      default: return errorKey;
    }
  }

  private toDisplayName(fieldName: string): string {
    const key = `FORM_FIELDS.${fieldName}`;
    const translated = this.translate.instant(key);
    
    // Check if a translation for the key exists
    if (translated !== key) {
      return translated;
    }

    // Fallback to the old method if no translation is found
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, strr => strr.toUpperCase());
  }
}