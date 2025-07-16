import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {

  constructor(
    private confirmationDialogService : ConfirmationDialogService,
    private router : Router,
    private datePipe : DatePipe) {}

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin,timeGridPlugin,interactionPlugin,listPlugin],
    selectable: true,
    selectAllow: (selectInfo) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return selectInfo.start >= today
    },
    selectMirror: true,
    selectOverlap: false,
    select : this.handleDateSelect.bind(this),
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
    events: [
      {
        title: 'Team Meeting',
        start: '2025-07-15T10:00:00',
        end: '2025-07-15T11:30:00',
      },
      {
        title: 'Event Setup',
        start: '2025-07-17',
      },
      {
        title: 'Music Festival',
        start: '2025-07-20',
        end: '2025-07-22',
      },
      {
        title: 'Venue Cleanup',
        start: '2025-07-23T14:00:00',
        end: '2025-07-23T16:00:00',
      },
      {
        title: 'Private Booking',
        start: '2025-07-25',
      }
    ]
  }

  async handleDateSelect(selectInfo: DateSelectArg){

    const { start, end, view } = selectInfo
    
    const startDateFormatted = this.datePipe.transform(start, 'MMM d, y, HH:mm:ss');

    let adjustedEnd = end;
    if(view.type === 'dayGridMonth' || selectInfo.allDay){
      adjustedEnd = new Date(end.getTime() - 1);
      // adjustedEnd.setDate(adjustedEnd.getSeconds() - 1);
    }

    const endDateFormatted = this.datePipe.transform(adjustedEnd,'MMM d, y, HH:mm:ss');

    const confirmed = await this.confirmationDialogService.confirm(
      `Create and event from ${startDateFormatted} to ${endDateFormatted}?`,
      'Create Event'
    );

    if(confirmed){
      this.router.navigate(['/organizer/create-event'],{
        queryParams: { start: start.toISOString(), end: adjustedEnd.toISOString()}
      });
    }

    selectInfo.view.calendar.unselect();

  }

}
