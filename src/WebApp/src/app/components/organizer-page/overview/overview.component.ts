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
  currUser : string;
  ngOnInit(): void {
      this.currUser = this.authService.getUserName();
      this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
      
              next:(response : Event[]) => {
                this.allEvents = response;
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
}
