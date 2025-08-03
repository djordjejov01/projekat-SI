import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventBasicInfoComponent } from './event-basic-info/event-basic-info.component';
import { EventManagementHeaderComponent } from './event-management-header/event-management-header.component';
import { MessageService } from 'primeng/api';
import { Activity, ApiService, Subevent } from '../../../Services/api.service';
import { EventBasicInfo } from '../../../Models/EventBasicInfo';
import { CommonModule } from '@angular/common';
import { TicketSectionComponent } from './ticket-section/ticket-section.component';
import { MapSectionComponent } from './map-section/map-section.component';
import { EventPinDto } from '../../../Models/EventPinDto';
import { forkJoin } from 'rxjs';
import { AgendaSectionComponent } from './agenda-section/agenda-section.component';

@Component({
  selector: 'app-event-management',
  imports: [EventBasicInfoComponent,EventManagementHeaderComponent,CommonModule,TicketSectionComponent,MapSectionComponent,AgendaSectionComponent],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.css'
})
export class EventManagementComponent implements OnInit{

  eventBasicInfo: EventBasicInfo | null = null;
  editMode = false;

  subevents : Subevent[] = [];
  activities : Activity[] = [];
  pins: EventPinDto[] = [];

  constructor(
    private route : ActivatedRoute,
    private messageService : MessageService,
    private apiService : ApiService){}

  ngOnInit(): void 
  {
    this.route.paramMap.subscribe(params =>{
      const id = Number(params.get('eventId'));
      if(!isNaN(id)){
        this.loadEvent(id);
      }
      else{

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Invalid event ID was passed`,
          life: 3000 });
      }
    });
  }

  loadEvent(id : number){
    this.apiService.getEventBasicInfo(id).subscribe({
      next: (data) =>{
        this.eventBasicInfo = data;
        this.loadAgenda();
      },
      error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorResponse.message,
            life: 3000 });
        }
    })
  }

  loadAgenda(){
      this.apiService.getAgenda(this.eventBasicInfo.getEventID()).subscribe({
        next: ({subevents, activities}) => {
          this.subevents = subevents;
          this.activities = activities;

          this.loadAllPins(this.eventBasicInfo.getEventID(), subevents)

          console.log(subevents)
          console.log(activities)
        },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error loading agenda',
              detail: err.message || 'Unknown error',
              life: 5000
            });
          }
      })
  }

  loadAllPins(eventId: number, subevents: Subevent[]){

    // Create an array of Observables to fetch pins for main event + each subevent
    const pinObservables = [
      this.apiService.getEventPins(eventId),
      ...subevents.map(se => this.apiService.getEventPins(se.id))
    ];

    forkJoin(pinObservables).subscribe({
      next: (pinArrays) =>{
        // Flatten array of arrays into a single pins array
        this.pins = pinArrays.flat();
      },
      error: (err) =>{
        this.messageService.add({
          severity: 'error',
          summary: 'Error loading pins',
          detail: err.message || 'Unknown error',
          life: 3000
        });
      }
    });
  }

  onAgendaChanged(){
    this.loadAgenda();
  }

onPinSaved(){
  if (this.eventBasicInfo && this.subevents) {
    this.loadAllPins(this.eventBasicInfo.getEventID(), this.subevents);
  }
}


  onToggleEditMode(editing: boolean){
    this.editMode = editing;
  }

  onEventUpdated(updatedEvent: EventBasicInfo){
    this.eventBasicInfo = updatedEvent
  }

}
