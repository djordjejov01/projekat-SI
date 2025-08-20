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
      //console.log(events)
      const calendarEvents : EventInput[] = events.map( event => ({
        title: event.getTitle(),
        start: event.getStartDateTime().toISOString(),
        end: event.getEndDateTime().toISOString(),
        allDay: this.isAllDayEvent(event.getStartDateTime(),event.getEndDateTime()),
        extendedProps: {
          category: this.categoryService.getCategoryName(event.getCategoryId()),
          location: event.getLocation(),
          organizer: event.getOrganizer()?.getUsername?.() || 'Unknown'
        }
      }));

      this.calendarOptions.events = calendarEvents
    });

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

  async handleDateSelect(selectInfo: DateSelectArg){

    const { start, end } = selectInfo
    
    const startDateFormatted = this.datePipe.transform(start, 'MMM d, y, HH:mm:ss');
    const endDateFormatted = this.datePipe.transform(end,'MMM d, y, HH:mm:ss');

    const confirmed = await this.confirmationDialogService.confirm(
      `Create a event from ${startDateFormatted} to ${endDateFormatted}?`,
      'Create Event'
    );

    if(confirmed){
      this.router.navigate(['/organizer/create-event'],{
        queryParams: { start: start.toISOString(), end: end.toISOString(), showID: 3}
      });
    }

    selectInfo.view.calendar.unselect();

  }

}
