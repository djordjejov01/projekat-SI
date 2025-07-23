import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventBasicInfoComponent } from './event-basic-info/event-basic-info.component';
import { EventManagementHeaderComponent } from './event-management-header/event-management-header.component';
import { Event } from '../../../Models/Event';

@Component({
  selector: 'app-event-management',
  imports: [EventBasicInfoComponent,EventManagementHeaderComponent],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.css'
})
export class EventManagementComponent implements OnInit{

  event: Event | null = null;
  editMode = false;

  constructor(private router : Router){}

  ngOnInit(): void 
  {
    const nav = history.state;

    if (nav && nav.event) 
      {
        const data = nav.event;
        this.event = new Event(
              data.eventId,
              data.organizerId,
              data.title,
              data.category,
              data.description,
              data.location,
              new Date(data.startDateTime),
              new Date(data.endDateTime),
              data.capacity,
              data.organizer ?? null,
              data.image,
              data.isFree,
              data.status
            );
          console.log('Received event from state:', this.event);
        } 
    else {
      console.warn('No event passed in router state');
      // Optional: fallback logic here
    }
  }

  onToggleEditMode(editing: boolean){
    this.editMode = editing;
  }

}
