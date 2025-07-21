import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomValidators{

    static passwordsMatch(group : AbstractControl): ValidationErrors | null{
        const password = group.get('password')?.value;
        const confirm = group.get('confirm')?.value;

        return password === confirm ? null : {passwordsDontMatch: true}
    }

    // static startBeforeEndValidator(group: FormGroup): ValidationErrors | null {
    //     const start = group.get('startDateTime')?.value;
    //     const end = group.get('endDateTime')?.value;
    //     if (start && end && new Date(start) >= new Date(end)) {
    //     return { startBeforeEnd: true };
    //     }
    //     return null;
    // }

    static startBeforeEndDates(startKey : string, endKey: string) : ValidatorFn {
        return (group: AbstractControl) : ValidationErrors | null => {

            const start = group.get(startKey)?.value;
            const end = group.get(endKey)?.value;
            if(start && end && new Date(start) >= new Date(end)){
                return { startBeforeEnd: true };
            }
            return null;
        };
    }

  static noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
        const value = (control.value || '').toString();
        if (value.length > 0 && value.trim().length === 0) {
            return { whitespace: true };
        }
        return null;
    }

    static notInPast(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const selectedDate = new Date(value);
    const now = new Date();

    // Remove seconds & ms for looser comparison (optional)
    selectedDate.setSeconds(0, 0);
    now.setSeconds(0, 0);

    return selectedDate < now ? { pastDate: true } : null;
    }

}