import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core'; 

// Models & DTOs
import { Activity, ApiService } from '../../../../Services/api.service';
import { Subevent } from '../../../../Services/api.service';

// PrimeNG modules
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

// Modal components
import { ActivityModalComponent } from './activity-modal/activity-modal.component';
import { SubeventModalComponent } from './subevent-modal/subevent-modal.component';
import { Router } from '@angular/router';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';

// i18n
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agenda-section',
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

  constructor(
    private router: Router,
    private translate: TranslateService // spremno za korišćenje prevoda
  ) {}

  goToSubeventManagement(subeventId: number) {
    this.router.navigate(['/organizer/event-management', subeventId]);
  }

  onActivityCreated() {
    this.agendaChanged.emit();

    // Primer ako želiš notifikaciju sa prevodom
    // const msg = this.translate.instant('AGENDA.ACTIVITY_CREATED');
    // console.log(msg);
  }

  onSubeventCreated() {
    this.agendaChanged.emit();

    // Primer ako želiš notifikaciju sa prevodom
    // const msg = this.translate.instant('AGENDA.SUBEVENT_CREATED');
    // console.log(msg);
  }
}
