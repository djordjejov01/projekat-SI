import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { CustomValidators } from '../../../Validators/custom.validators';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { SelectModule } from 'primeng/select';
import { IDeactivate } from '../../../Interfaces/IDeactivate';
import { Observable, Subscription, take } from 'rxjs';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { CategoryService } from '../../../Services/EventCategoryService';
import { FormValidationService } from '../../../Services/FormValidationService';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Event } from '../../../Models/Event';


@Component({
  selector: 'app-create-event',
  imports: [TranslateModule,CommonModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, Checkbox, TextareaModule, DatePickerModule, InputNumber, ButtonModule, FileUpload, SelectModule, AutoCompleteModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit, IDeactivate, OnDestroy {

  eventForm: FormGroup;
  currencyCode: string;
  localeCode: string;
  minDate: Date;
  selectedImageFile: File | null = null;
  categories = [];

  eventStart: Date | null = null;
  eventEnd: Date | null = null;
  filteredLocations: any[] = [];

  private subscriptions = new Subscription();

  @ViewChild('fileUpload') fileUpload: FileUpload | undefined;

  constructor(
    private translateService: TranslateService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private confirmationDialogService: ConfirmationDialogService,
    private categoryService: CategoryService,
    private fromValidationService: FormValidationService,
    private router: Router) { }

ngOnInit(): void {
  this.minDate = new Date();

  this.categoryService.loadCategoriesIfEmpty()
    .pipe(take(1))
    .subscribe(categories => {
      this.categories = categories.map(cat => ({
        label: cat.name,
        value: cat.id
      }));
    });

  const currentLang = this.translateService.currentLang || 'en';
  if (currentLang === 'sr') {
    this.currencyCode = 'RSD';
    this.localeCode = 'sr-RS';
  } else {
    this.currencyCode = 'EUR';
    this.localeCode = 'en-US';
  }

  this.subscriptions.add(this.translateService.onLangChange.subscribe(lang => {
    if (lang.lang === 'sr') {
      this.currencyCode = 'RSD';
      this.localeCode = 'sr-RS';
    } else {
      this.currencyCode = 'EUR';
      this.localeCode = 'en-US';
    }
  }));

  this.eventForm = new FormGroup({
    title: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
    description: new FormControl('', [CustomValidators.noWhitespaceValidator, Validators.required]),
    location: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
    isUnlimitedCapacity: new FormControl(false),
    capacity: new FormControl('', [Validators.required, Validators.min(1)]),
    startDateTime: new FormControl('', [Validators.required, CustomValidators.notInPast]),
    endDateTime: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    tickets: new FormArray([
      new FormGroup({
        name: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
        price: new FormControl('', [Validators.required, Validators.min(1)]),
        description: new FormControl('', [CustomValidators.noWhitespaceValidator, Validators.required]),
        quota: new FormControl('', [Validators.required, Validators.min(1)]),
        validFrom: new FormControl({ value: '', disabled: true }, [Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)]),
        validUntil: new FormControl({ value: '', disabled: true }, [Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)])
      }, { validators: CustomValidators.startBeforeEndDates('validFrom', 'validUntil') }),
    ]),
  }, { validators: CustomValidators.startBeforeEndDates('startDateTime', 'endDateTime') });

  this.subscriptions.add(this.eventForm.get('isUnlimitedCapacity')?.valueChanges.subscribe((unlimited) => {
    const capacityControl = this.eventForm.get('capacity');
    if (unlimited) {
      capacityControl?.disable();
      capacityControl?.clearValidators();
      capacityControl?.setValue(null);
      capacityControl.updateValueAndValidity();
    } else {
      capacityControl?.enable();
      capacityControl?.setValidators([Validators.required, Validators.min(1)]);
      capacityControl.updateValueAndValidity();
    }
  }));

  this.subscriptions.add(this.route.queryParams.subscribe(params => {
    const start = params['start'];
    const end = params['end'];

    const parsedStart = new Date(start);
    const parsedEnd = new Date(end);

    if (!isNaN(parsedStart.getTime())) {
      this.eventForm.patchValue({ startDateTime: parsedStart });
      this.eventForm.markAsDirty();
    }

    if (!isNaN(parsedEnd.getTime())) {
      this.eventForm.patchValue({ endDateTime: parsedEnd });
      this.eventForm.markAsDirty();
    }
  }));

  this.subscriptions.add(this.eventForm.get('startDateTime')?.valueChanges.subscribe(value => {
    this.eventStart = value;
    this.toggleTicketDateControls();
    this.updateTicketDateValidators();
  }));

  this.subscriptions.add(this.eventForm.get('endDateTime')?.valueChanges.subscribe(value => {
    this.eventEnd = value;
    this.toggleTicketDateControls();
    this.updateTicketDateValidators();
  }));

  this.eventForm.get('isUnlimitedCapacity')?.updateValueAndValidity({ onlySelf: true, emitEvent: true });

}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get tickets(): FormArray {
    return this.eventForm.get('tickets') as FormArray
  }

  addTicket() {
    this.tickets.push(
      new FormGroup({
          name: new FormControl('',[Validators.required, CustomValidators.noWhitespaceValidator]),
          price: new FormControl('', [Validators.required, Validators.min(1)]),
          description: new FormControl('', [CustomValidators.noWhitespaceValidator,Validators.required]),
          quota: new FormControl('',[Validators.required,Validators.min(1)]),
          validFrom: new FormControl({value: '', disabled: !(this.eventStart && this.eventEnd)}, [Validators.required,CustomValidators.dateWithinRange(this.eventStart,this.eventEnd)]),
          validUntil: new FormControl({value: '', disabled: !(this.eventStart && this.eventEnd)},[Validators.required,CustomValidators.dateWithinRange(this.eventStart,this.eventEnd)])

      }, { validators: CustomValidators.startBeforeEndDates('validFrom', 'validUntil') })
    );

    this.toggleTicketDateControls();
  }

  async removeTicket(index: number){
    const confirmed = await this.confirmationDialogService.confirm(
      `Are you sure you want to remove the ticket?`,
      `Remove ticket`
    )
    if(!confirmed) return;
    this.tickets.removeAt(index);
  }

  toggleTicketDateControls(): void {
    const tickets = this.eventForm.get('tickets') as FormArray;
    const enable = this.eventStart !== null && this.eventEnd !== null;

    tickets.controls.forEach(ticketGroup => {
      const formControl = ticketGroup.get('validFrom');
      const untilControl = ticketGroup.get('validUntil');

      if (enable) {
        formControl?.enable({ emitEvent: false });
        untilControl?.enable({ emitEvent: false });
      } else {
        formControl?.disable({ emitEvent: false });
        untilControl?.disable({ emitEvent: false });
      }
    });
  }

private updateTicketDateValidators() {
    const tickets = this.eventForm.get('tickets') as FormArray;
    tickets.controls.forEach(ticketGroup => {
      const validFromControl = ticketGroup.get('validFrom');
      const validUntilControl = ticketGroup.get('validUntil');

      validFromControl?.setValidators([Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)]);
      validUntilControl?.setValidators([Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)]);

      validFromControl?.updateValueAndValidity();
      validUntilControl?.updateValueAndValidity();
    });
  }

  onFileSelect(event: any): void {
    this.selectedImageFile = event.files[0] || null
  }

  onFileClear(): void {
    this.selectedImageFile = null;
  }

  searchLocations(event: any) {
    const query = event.query.trim();
    if (!query) return;

    this.apiService.searchLocations(query).subscribe((results) => {
      this.filteredLocations = results
    })
  }

  onLocationSelect(event: any) {
    const location = event.value;
    this.eventForm.patchValue({ location: location.display_name });
  }

submitForm(): void {
  if (this.eventForm.invalid) {
    this.fromValidationService.showValidationErrors(
      this.eventForm,
      this.translateService.instant('EVENT.CARD_TITLE')
    );
    return;
  }

  const formValues = this.eventForm.getRawValue();
  const tickets = formValues.tickets ?? [];
  const capacity = formValues.isUnlimitedCapacity ? -1 : formValues.capacity;

  const formData = new FormData();

  formData.append('Title', formValues.title);
  formData.append('Description', formValues.description);
  formData.append('Location', formValues.location);
  formData.append('StartDateTime', new Date(formValues.startDateTime).toISOString());
  formData.append('EndDateTime', new Date(formValues.endDateTime).toISOString());
  formData.append('Capacity', capacity.toString());
  formData.append('Category', formValues.category.toString());

  if (this.selectedImageFile) {
    formData.append('ImageFile', this.selectedImageFile);
  }

  tickets.forEach((ticket, index) => {
    formData.append(`Tickets[${index}].Name`, ticket.name);
    formData.append(`Tickets[${index}].Price`, ticket.price.toString());
    formData.append(`Tickets[${index}].ValidFrom`, new Date(ticket.validFrom).toISOString());
    formData.append(`Tickets[${index}].ValidUntil`, new Date(ticket.validUntil).toISOString());
    formData.append(`Tickets[${index}].Quota`, ticket.quota.toString());
    formData.append(`Tickets[${index}].Description`, ticket.description);
  });

  const organizerId = this.authService.getUserId();

  this.apiService.createEvent(formData, organizerId).subscribe({
    next: (response) => {
      const message = response.headers?.get('Location') || this.translateService.instant('SUCCESS');
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: message
      });

      this.eventForm.reset();
      this.selectedImageFile = null;
      this.eventForm.get('isUnlimitedCapacity')?.setValue(false);
      this.fileUpload?.clear();

      const ticketsArray = this.eventForm.get('tickets') as FormArray;
      while (ticketsArray.length > 0) {
        ticketsArray.removeAt(0);
      }

      ticketsArray.push(new FormGroup({
        name: new FormControl('', [Validators.required, CustomValidators.noWhitespaceValidator]),
        price: new FormControl('', [Validators.required, Validators.min(1)]),
        description: new FormControl('', [CustomValidators.noWhitespaceValidator, Validators.required]),
        quota: new FormControl('', [Validators.required, Validators.min(1)]),
        validFrom: new FormControl({ value: '', disabled: true }, [Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)]),
        validUntil: new FormControl({ value: '', disabled: true }, [Validators.required, CustomValidators.dateWithinRange(this.eventStart, this.eventEnd)])
      }, { validators: CustomValidators.startBeforeEndDates('validFrom', 'validUntil') }));

      this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
        next: (response: any) => {
          let ider = response[response.length - 1].getEventId()
          this.router.navigate([`/organizer/event-management/${ider}`]);
        },
        error: (errorResponse) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorResponse.message, life: 3000 });
        }
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('ERROR'),
        detail: this.translateService.instant('ERROR')
      });
    }
  });
}


  canExit(): boolean | Observable<boolean> | Promise<boolean>{

    if(this.authService.isLoggingOut()) return true;

    const formDirty = this.eventForm?.dirty;
    const hasImage = !!this.selectedImageFile;
    const shouldWarn = formDirty || hasImage;

    return shouldWarn
      ? this.confirmationDialogService.confirm(
        this.translateService.instant('EVENT.UNSAVED_CHANGES_CONFIRM'),
        this.translateService.instant('EVENT.UNSAVED_CHANGES_TITLE')
      )
      : true;
  }
}
