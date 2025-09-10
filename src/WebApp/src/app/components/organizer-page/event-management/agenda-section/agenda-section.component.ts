import { Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core'; 

// Models & DTOs
import { Activity, ApiService, Subevent } from '../../../../Services/api.service';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ActivityDto } from '../../../../Models/ActivityDto';

// PrimeNG modules
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';

// Modal components
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { SubeventModalComponent } from './subevent-modal/subevent-modal.component';
import { Router } from '@angular/router';

// i18n
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agenda-section',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    TooltipModule,
    ButtonModule,
    ActivityModalComponent,
    SubeventModalComponent,
    TranslateModule // dodato za translate pipe u HTML-u
  ],
  templateUrl: './agenda-section.component.html',
  styleUrls: ['./agenda-section.component.css']
})
export class AgendaSectionComponent {

  @Input() subevents: Subevent[] = [];
  @Input() activities: Activity[] = [];
  @Output() agendaChanged = new EventEmitter<void>();

  @Input() eventBasicInfo!: EventBasicInfo;

    @ViewChild('activityModal') activityModal!: ActivityModalComponent;
    @ViewChild('subeventModal') subeventModal!: SubeventModalComponent;

    constructor(
      private router : Router,
      private apiService : ApiService,
      private messageService : MessageService,
      private confirmationDialogService: ConfirmationDialogService,
      private translate: TranslateService
    ) {}


    goToSubeventManagement(subeventId : number){
        this.router.navigate(['/organizer/event-management', subeventId])
    }

    onActivityCreated() {
      this.agendaChanged.emit();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('AGENDA.ACTIVITY_CREATED') });
    }

    onSubeventCreated() {
      this.agendaChanged.emit();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('AGENDA.SUBEVENT_CREATED') });
    }

    onActivityUpdated() {
      this.agendaChanged.emit();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translate.instant('AGENDA.ACTIVITY_UPDATED') });
    }

    /** EDITED: Opens the ActivityModalComponent for editing using its new showForEdit method */
    editActivity(activity: Activity) {
      // Create an ActivityDto from the Activity interface to pass to the modal
      const dto = new ActivityDto(
        activity.eventId,
        activity.title,
        activity.startDateTime.toISOString(), // Convert Date to ISO string
        activity.endDateTime.toISOString(),   // Convert Date to ISO string
        activity.description,
        activity.category, // category is already a number
        activity.id        // activity ID for existing activity
      );
      this.activityModal.showForEdit(dto); // Call the modal's showForEdit method
    }

    /** Handles deletion of an activity, with confirmation */
    async deleteActivity(activityId: number) {
      const confirmed = await this.confirmationDialogService.confirm(
        this.translate.instant('AGENDA.DELETE_ACTIVITY_CONFIRM_MSG'),
        this.translate.instant('AGENDA.DELETE_ACTIVITY_CONFIRM_TITLE')
      );

      if (confirmed) {
        this.apiService.deleteActivity(activityId).subscribe({
          next: (response) => {
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.DELETED'), detail: response.message || this.translate.instant('AGENDA.ACTIVITY_DELETED_SUCCESS') });
            this.agendaChanged.emit(); // Refresh the agenda
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.message || this.translate.instant('AGENDA.ACTIVITY_DELETED_ERROR') });
          }
        });
      }
    }
}
