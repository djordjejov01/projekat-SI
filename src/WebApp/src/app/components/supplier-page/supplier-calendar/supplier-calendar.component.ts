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
    private categoryService : CategoryService) {}

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

  ngOnInit(): void {

      this.calendarOptions.events = [
    {
        "title": "Mikrofon",
        "start": "2025-07-23T22:00:00.000Z",
        "end": "2025-07-26T21:59:59.999Z",
        "allDay": false
    },
    {
        "title": "Zvucnici",
        "start": "2025-07-28T22:00:00.000Z",
        "end": "2025-07-31T21:59:59.999Z",
        "allDay": false
    },
    {
        "title": "Bina",
        "start": "2025-08-09T22:00:00.000Z",
        "end": "2025-08-15T22:00:00.000Z",
        "allDay": true
    }];

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
}
