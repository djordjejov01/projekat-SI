import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import srLocale from '@fullcalendar/core/locales/sr';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { CategoryService } from '../../../Services/EventCategoryService';
import { ResourceDto } from '../../../Models/ResourceDto';
import { MessageService } from 'primeng/api';
import { EventResourceCalendarResponse } from '../../../Interfaces/EventResourceCalendarResponse';
import { TranslateModule,TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-calendar',
  imports: [TranslateModule,FullCalendarModule],
  templateUrl: './supplier-calendar.component.html',
  styleUrls: ['./supplier-calendar.component.css']
})
export class SupplierCalendarComponent implements OnInit {

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    selectable: true,
    locale: srLocale,
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
  };

  reusableResources: ResourceDto[];
  bookedResources: EventResourceCalendarResponse[] = [];

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadResources();
    this.loadBookedResources();
    this.setCalendarButtonTexts();

    // Pretplata na promenu jezika
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setCalendarButtonTexts();
    });
  }

  private loadResources() {
    this.apiService.getReusableResources().subscribe({
      next: (response: any) => {
        this.reusableResources = response;
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  private loadBookedResources() {
    this.apiService.getBookedResources().subscribe({
      next: (response: any) => {
        this.bookedResources = response;
        this.calendarOptions.events = this.mapToCalendarEvents(this.bookedResources);
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
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

  private mapToCalendarEvents(apiResponse: EventResourceCalendarResponse[]) {
    return apiResponse.map(item => {
      const start = new Date(item.EventStartDate);
      const end = new Date(item.EventEndDate);

      return {
        title: item.ResourceName,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: this.isAllDayEvent(start, end)
      };
    });
  }

  private setCalendarButtonTexts() {
    if (!this.calendarOptions) return;

    this.calendarOptions.buttonText = {
      today: this.translate.instant('KALENDAR.TODAY'),
      month: this.translate.instant('KALENDAR.MONTH'),
      week: this.translate.instant('KALENDAR.WEEK'),
      day: this.translate.instant('KALENDAR.DAY'),
      list: this.translate.instant('KALENDAR.LIST')
    };
    this.calendarOptions.allDayText = this.translate.instant('CALENDAR.ALL_DAY');

    // Rerender kalendara da bi se dugmići odmah osvežili
    if ((window as any).calendarApi) {
      (window as any).calendarApi.render();
    }
  }
}
