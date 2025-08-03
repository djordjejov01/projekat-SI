import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Angular core
import { ViewChild } from '@angular/core'; // Only needed if used in agenda

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


@Component({
  selector: 'app-agenda-section',
  imports: [
  CommonModule,
  AccordionModule,
  TooltipModule,
  ButtonModule,
  ActivityModalComponent,
  SubeventModalComponent
],

  templateUrl: './agenda-section.component.html',
  styleUrl: './agenda-section.component.css'
})
export class AgendaSectionComponent {

    @Input() subevents : Subevent[] = [];
    @Input() activities : Activity[] = [];
    @Output() agendaChanged = new EventEmitter<void>();

    @Input() eventBasicInfo! : EventBasicInfo;

    constructor(private router : Router) {}


  goToSubeventManagement(subeventId : number){
    this.router.navigate(['/organizer/event-management', subeventId])
  }

  onActivityCreated(){
      this.agendaChanged.emit()
  }

  onSubeventCreated(){
    this.agendaChanged.emit()
  }

}
