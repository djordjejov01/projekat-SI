import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { Event } from '../../../Models/Event';
import { CategoryService } from '../../../Services/EventCategoryService';
import { ResourceDto } from '../../../Models/ResourceDto';
import { MessageService } from 'primeng/api';
import { EventResourceCalendarResponse } from '../../../Interfaces/EventResourceCalendarResponse';

@Component({
  selector: 'app-supplier-calendar',
  imports: [FullCalendarModule],
  templateUrl: './supplier-calendar.component.html',
  styleUrl: './supplier-calendar.component.css'
})
export class SupplierCalendarComponent implements OnInit {
  
  constructor(
    private confirmationDialogService : ConfirmationDialogService,
    private router : Router,
    private datePipe : DatePipe,
    private apiService : ApiService,
    private authService : AuthService,
    private categoryService : CategoryService,
  private messageService : MessageService) {}

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin,timeGridPlugin,interactionPlugin,listPlugin],
    selectable: true,
    selectAllow: (selectInfo) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return selectInfo.start >= today
    },
    selectMirror: true,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    events: []
  }
  reusableResources : ResourceDto[];

  bookedResources : EventResourceCalendarResponse[] = [];

  ngOnInit(): void {

      this.apiService.getReusableResources().subscribe({
          
                next: (response: any) => {
                  this.reusableResources = response;
                },
                error: (errorResponse) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorResponse.message,
                    life: 3000
                  });
                }
          
              })
      this.apiService.getBookedResources().subscribe({
          
                next: (response: any) => {
                  this.bookedResources = response;
                  console.log(this.bookedResources);
                  console.log(this.bookedResources);
                  console.log("KER",this.mapToCalendarEvents(this.bookedResources));
                  this.calendarOptions.events = this.mapToCalendarEvents(this.bookedResources);
                },
                error: (errorResponse) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorResponse.message,
                    life: 3000
                  });
                }
          
              })
      
      

  }

  private isAllDayEvent(start: Date, end: Date): boolean {
    return (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getTime() - start.getTime() >= 24 * 60 * 60 * 1000
    );
  }

  // Pretvaranje u FullCalendar format
mapToCalendarEvents(apiResponse: EventResourceCalendarResponse[]) {
  return apiResponse.map(item => {
    const start = new Date(item.EventStartDate);
    const end = new Date(item.EventEndDate);

    return {
      title: item.ResourceName,   // ili item.eventTitle ako želiš event ime
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: this.isAllDayEvent(start, end)
    };
  });
}

}
