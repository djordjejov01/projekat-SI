import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventBasicInfoComponent } from './event-basic-info/event-basic-info.component';
import { EventManagementHeaderComponent } from './event-management-header/event-management-header.component';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../Services/api.service';
import { EventBasicInfo } from '../../../Models/EventBasicInfo';
import { CommonModule } from '@angular/common';
import { TicketSectionComponent } from './ticket-section/ticket-section.component';
import { MapSectionComponent } from './map-section/map-section.component';

@Component({
  selector: 'app-event-management',
  imports: [EventBasicInfoComponent,EventManagementHeaderComponent,CommonModule,TicketSectionComponent,MapSectionComponent],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.css'
})
export class EventManagementComponent implements OnInit{

  eventBasicInfo: EventBasicInfo | null = null;
  editMode = false;

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

  onToggleEditMode(editing: boolean){
    this.editMode = editing;
  }

  onEventUpdated(updatedEvent: EventBasicInfo){
    this.eventBasicInfo = updatedEvent
  }

}
