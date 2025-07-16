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


@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit{

  constructor(
    private confirmationDialogService : ConfirmationDialogService,
    private router : Router,
    private datePipe : DatePipe,
    private apiService : ApiService,
    private authService : AuthService) {}

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
    events: []
  }

  ngOnInit(): void {
    
    this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe((events: Event[]) => {
      console.log(events)
      const calendarEvents : EventInput[] = events.map( event => ({
        title: event['title'],
        start: event['startDateTime'].toISOString(),
        end: event['endDateTime'].toISOString(),
        allDay: this.isAllDayEvent(event['startDateTime'],event['endDateTime']),
        extendedProps: {
          category: event['category'],
          location: event['location'],
          organizer: event['organizer']?.getUsername?.() || 'Unknown'
        }
      }));

      this.calendarOptions.events = calendarEvents
    });

  }

  private isMidnightOrJustBefore(date: Date): boolean {
    return (
      (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0)
      ||
      (date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59 && date.getMilliseconds() === 999)
    );
  }

  private isAllDayEvent(start: Date, end: Date): boolean {
    if (!this.isMidnightOrJustBefore(start) || !this.isMidnightOrJustBefore(end)) return false;

    const diffDays = (end.getTime() - start.getTime() + 1) / (1000 * 60 * 60 * 24); // add 1 ms back for diff calc

    return diffDays >= 1 && Number.isInteger(diffDays);
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
