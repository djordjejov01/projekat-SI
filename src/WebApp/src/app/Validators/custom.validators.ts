import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

export class CustomValidators{

    static passwordsMatch(group : AbstractControl): ValidationErrors | null{
        const password = group.get('password')?.value;
        const confirm = group.get('confirm')?.value;

        return password === confirm ? null : {passwordsDontMatch: true}
    }

}