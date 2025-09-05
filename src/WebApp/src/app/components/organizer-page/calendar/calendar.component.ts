import { Component, OnInit, OnDestroy } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import srLocale from '@fullcalendar/core/locales/sr';
import enLocale from '@fullcalendar/core/locales/en-gb';

import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { Event } from '../../../Models/Event';
import { CategoryService } from '../../../Services/EventCategoryService';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, TranslateModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private langChangeSub: Subscription;

  constructor(
    private confirmationDialogService : ConfirmationDialogService,
    private router : Router,
    private datePipe : DatePipe,
    private apiService : ApiService,
    private authService : AuthService,
    private categoryService : CategoryService,
  private translate : TranslateService) {}

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
    events: [],
    eventClick: this.handleEventClick.bind(this) // Dodata nova opcija
  }

  ngOnInit(): void {
    this.initCalendarOptions();

    // sluša promene jezika
    this.langChangeSub = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateButtonText();
      this.updateLocale(event.lang);
    });

    // učitaj događaje
    this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe((events: Event[]) => {
      const calendarEvents: EventInput[] = events.map(event => ({
        title: event.getTitle(),
        start: event.getStartDateTime().toISOString(),
        end: event.getEndDateTime().toISOString(),
        id: event.getEventId().toString(),
        allDay: this.isAllDayEvent(event.getStartDateTime(),event.getEndDateTime()),
        extendedProps: {
          category: this.categoryService.getCategoryName(event.getCategoryId()),
          location: event.getLocation(),
          organizer: event.getOrganizer()?.getUsername?.() || this.translate.instant('CALENDAR.UNKNOWN')
        }
      }));

      this.calendarOptions.events = calendarEvents;
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }

  private initCalendarOptions() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      locales: [srLocale, enLocale],
      locale: this.getCurrentLocale(),
      selectable: true,
      selectAllow: (selectInfo) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectInfo.start >= today;
      },
      selectMirror: true,
      select: this.handleDateSelect.bind(this),
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
      allDayText: this.translate.instant('CALENDAR.ALL_DAY'),
      events: [],
      buttonText: {}
    };

    this.updateButtonText();
  }

  private updateButtonText() {
    this.calendarOptions.buttonText = {
      today: this.translate.instant('KALENDAR.TODAY'),
      month: this.translate.instant('KALENDAR.MONTH'),
      week: this.translate.instant('KALENDAR.WEEK'),
      day: this.translate.instant('KALENDAR.DAY'),
      list: this.translate.instant('KALENDAR.LIST')
    };

    // ažurira i "all-day"
    this.calendarOptions.allDayText = this.translate.instant('KALENDAR.ALL_DAY');
  }

  private updateLocale(lang: string) {
    this.calendarOptions.locale = lang === 'sr' ? 'sr' : 'en-gb';
  }

  private getCurrentLocale(): string {
    return this.translate.currentLang === 'sr' ? 'sr' : 'en-gb';
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

  async handleDateSelect(selectInfo: DateSelectArg) {
    const { start, end } = selectInfo;

    const startDateFormatted = this.datePipe.transform(start, 'MMM d, y, HH:mm:ss');
    const endDateFormatted = this.datePipe.transform(end, 'MMM d, y, HH:mm:ss');

    const message = this.translate.instant('CREATE_EVENT_MSG', { start: startDateFormatted, end: endDateFormatted });
    const title = this.translate.instant('CREATE_EVENT_TITLE');

    const confirmed = await this.confirmationDialogService.confirm(message, title);

    if (confirmed) {
      this.router.navigate(['/organizer/create-event'], {
        queryParams: { start: start.toISOString(), end: end.toISOString(), showID: 3 }
      });
    }

    selectInfo.view.calendar.unselect();
  }
  handleEventClick(clickInfo: any) {
    const eventId = clickInfo.event.id; 
    if (eventId) {
        this.router.navigate(['/organizer/event-management/', eventId]); 
    }
  }
}
