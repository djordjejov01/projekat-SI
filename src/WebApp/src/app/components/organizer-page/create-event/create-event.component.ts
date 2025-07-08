import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-create-event',
  imports: [CommonModule,ReactiveFormsModule,FloatLabelModule,InputTextModule,Checkbox,TextareaModule,DatePickerModule,InputNumber,ButtonModule,FileUpload],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent implements OnInit{

  eventForm : FormGroup;
  currencyCode : string;
  localeCode : string;
  selectedImageFile: File | null = null;

  constructor( private translateService : TranslateService) {}

  ngOnInit(): void {

      const currentLang = this.translateService.currentLang || 'en';
      if (currentLang === 'sr') {
        this.currencyCode = 'RSD';
        this.localeCode = 'sr-RS';
      } else {
        this.currencyCode = 'EUR';
        this.localeCode = 'en-US';
      }

   this.translateService.onLangChange.subscribe(lang => {
      if (lang.lang === 'sr') {
        this.currencyCode = 'RSD';
        this.localeCode = 'sr-RS';
      } else {
        this.currencyCode = 'EUR';
        this.localeCode = 'en-US';
      }
    });

    this.eventForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      location: new FormControl('', Validators.required),
      isUnlimitedCapacity: new FormControl(false),
      capacity: new FormControl('', [Validators.required,Validators.min(1)]),
      startDateTime: new FormControl('', Validators.required),
      endDateTime: new FormControl('', Validators.required),
      tickets: new FormArray([
        new FormGroup({
          name: new FormControl('',Validators.required),
          price: new FormControl('', [Validators.required, Validators.min(0)])
        }),
      ]),
    })


    this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited)=>{

        const capacityControl = this.eventForm.get('capacity');
        if(unlimited){
          capacityControl?.disable();
          capacityControl?.setValue(null);
        }else{
          capacityControl?.enable()
        }

      });
  }

  get tickets(): FormArray{
    return this.eventForm.get('tickets') as FormArray
  }

  addTicket(){
    this.tickets.push(
      new FormGroup({
          name: new FormControl('',Validators.required),
          price: new FormControl('', [Validators.required, Validators.min(0)])
      })
    );
  }

  removeTicket(index: number){
    this.tickets.removeAt(index);
  }

  onFileSelect(event : any) : void{
    this.selectedImageFile = event.files[0] || null
  }

  onFileClear() : void{
    this.selectedImageFile = null;
  }

  submitForm() : void
  {

    if(this.eventForm.invalid) return;
    const formValues = this.eventForm.getRawValue();

    const {isUnlimitedCapacity, ...cleanValues} = formValues

    const fullData ={
      ...cleanValues,
      image: this.selectedImageFile
    };

    console.log(fullData)
    

  }
}
