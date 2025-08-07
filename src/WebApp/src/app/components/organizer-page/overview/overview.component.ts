import { Component, OnInit } from '@angular/core';
import { NewestEventComponent } from './newest-event/newest-event.component';
import { EventPreviewComponent } from './event-preview/event-preview.component';
import { TranslateModule } from '@ngx-translate/core';
import { Event } from '../../../Models/Event';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-overview',
  imports: [NewestEventComponent, EventPreviewComponent, TranslateModule, CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {


  constructor(private apiService : ApiService, private authService : AuthService, private messageService : MessageService,
    private router : Router
  ){}
  allEvents : Event[];
  filteredEvents : Event[];
  currUser : string;
  ngOnInit(): void {
      this.currUser = this.authService.getUserName();
      this.apiService.getUpcomingOrganizerEvents(this.authService.getUserId()).subscribe({
      
              next:(response : Event[]) => {
                this.allEvents = response;
                this.filteredEvents = response;
                console.log(response);
              },
              error:(errorResponse) =>{
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorResponse.message,
                    life: 3000 });
              }
      
            })
      
      
  }
  createEvent(){
    this.router.navigate(["/organizer/create-event"],{
        queryParams: { showID: 3}
      });

  }

  changeStatus(event: globalThis.Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;
  const status = Number(selectedValue);

  switch (status) {
    case -1:
      this.filteredEvents = this.allEvents;
      break;
    case 0:
      this.filteredEvents = this.allEvents.filter(event => event.getStatus() === status);
      break;
    case 1:
      this.filteredEvents = this.allEvents.filter(event => event.getStatus() === status);
      break;
    case 2:
      this.filteredEvents = this.allEvents.filter(event => event.getStatus() === status);
      break;
    default:
      this.filteredEvents = this.allEvents;
      break;
  }

}
}
