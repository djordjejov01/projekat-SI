import { Component, HostListener, numberAttribute, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { Slider } from 'primeng/slider';
import { ProgressBar } from 'primeng/progressbar';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Event } from '../../../Models/Event';
import { ChartModule, UIChart } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardMetrics } from '../../../Interfaces/DashboardMetricsResponse';
import { StatusMetrics } from '../../../Interfaces/StatusMetricsResponse';
import { CategoryMetrics } from '../../../Interfaces/CategoryMetricsResponse';
import { CategoryService } from '../../../Services/EventCategoryService';
import { MonthlyMetrics } from '../../../Interfaces/MonthlyMetricsResponse';
import { take } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../Services/shared.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-events',
  imports: [
    CommonModule,
    ChartModule,
    TableModule,
    ButtonModule,
    MultiSelectModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    IconField,
    InputIcon,
    TableModule,
    ConfirmDialogModule,
    TooltipModule,
    TranslateModule
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  selectedCategories: any[] = [];
  categories: any[] = [];
  selectedStatus: any[] = [];
  statuses = [
    { name: 'DRAFT', value: 0 },
    { name: 'PUBLISHED', value: 1 },
    { name: 'CANCELED', value: 2 }
  ];

  loading: boolean = true;
  allEvents: Event[];
  selectedEvents: Event[];
  dashboardMetrics: DashboardMetrics;
  statusMetrics: StatusMetrics;
  monthlyMetrics: MonthlyMetrics[];
  searchValue: string;
  currUser: string;

  data1;
  data2;
  data3;
  data4;
  data1Labels: any[] = [];
  data2Labels: any[] = [];
  data3Labels: any[] = [];
  data4Labels: any[] = [];
  data1Data: any[] = [];
  data2Data: any[] = [];
  data3Data: any[] = [];
  data4Data: any[] = [];

  options1 = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#495057' } }
    },
    scales: {
      x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
      y: { beginAtZero: true, ticks: { color: '#495057', stepSize: 1 }, grid: { color: '#ebedef' } }
    }
  };
  options3 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#495057'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  catMetrics: CategoryMetrics;
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private catSer: CategoryService,
    private categoryService: CategoryService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService,
    private sharedEvents: SharedService
  ) {}

  onRoleFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedCategories = selectedOptions || [];
    const filterValues = this.selectedCategories.map(role => role.value);
    filterFn(filterValues.length ? filterValues : null);
  }
@ViewChild('graf1') graf1!: UIChart
@ViewChild('graf2') graf2!: UIChart
@ViewChild('graf3') graf3!: UIChart
@ViewChild('graf4') graf4!: UIChart
  clear(table: Table) {
    table.clear();
    this.selectedEvents = [];
    this.selectedCategories = [];
    this.selectedStatus = [];
    this.searchValue = "";
  }

  manageEvent(eID: number) {
    this.router.navigate(['organizer/event-management', eID]);
  }

  async deleteEvent(eventID: number) {
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('DELETE_CONFIRM'),
      this.translate.instant('DELETE_HEADER')
    );
    if (!confirmed) return;

    this.apiService.deleteEvent(eventID).subscribe({
      next: (response: any) => {
        this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
          next: (response: Event[]) => { this.allEvents = response; this.loading = false; },
          error: (errorResponse) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR'),
              detail: errorResponse.message,
              life: 3000
            });
          }
        });
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: response.message,
          life: 3000
        });
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
  private destroy$ = new Subject<void>();
  getCatName(catID: number) {
    return this.catSer.getCategoryName(catID);
  }
@HostListener('window:resize')
  onResize() {
    if (this.graf1 && this.graf1.chart) {
      this.graf1.chart.resize();
      this.graf1.chart.update();
    }

    if (this.graf2 && this.graf2.chart) {
      this.graf2.chart.resize();
      this.graf2.chart.update();
    }
    if (this.graf3 && this.graf3.chart) {
      this.graf3.chart.resize();
      this.graf3.chart.update();
    }
    if (this.graf4 && this.graf4.chart) {
      this.graf4.chart.resize();
      this.graf4.chart.update();
    }
  }
  ngOnInit() {
    this.data1Labels = [];
        this.data1Data = [];
        this.data2Labels = [];
        this.data2Data = [];
        this.data4Labels = [];
        this.data4Data = [];
        this.data3Labels = [];
        this.data3Data = [];
        this.data1 = {};
        this.data2 = {};
        this.data3 = {};
        this.data4 = {};
    this.categoryService.loadCategoriesIfEmpty().pipe(take(1)).subscribe(categories => {
      this.categories = categories.map(cat => ({ name: cat.name, value: cat.id }));
    });

    this.currUser = this.authService.getUserName();

    this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
      next: (response: Event[]) => { this.allEvents = response; this.loading = false; },
      error: () => {}
    });

    this.apiService.getDashboardMetrics().subscribe({
      next: (response: DashboardMetrics) => { this.dashboardMetrics = response; },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });

    this.apiService.getMonthlyMetrics(this.authService.getUserId(), 2025).subscribe({
      next: (response: MonthlyMetrics[]) => {
        this.monthlyMetrics = response;
        response.forEach(val => {
          this.data1Labels.push(val.month);
          this.data4Labels.push(val.month);
          this.data1Data.push(val.visitors);
          this.data4Data.push(val.revenue);
        });
        this.data1 = {
          labels: this.data1Labels,
          datasets: [{ label: this.translate.instant('VISITORS'), backgroundColor: 'rgba(100,106,232,0.2)', borderColor: 'rgb(139,92,246)', borderWidth: 1, data: this.data1Data }]
        };
        this.data4 = {
          labels: this.data4Labels,
          datasets: [{ label: this.translate.instant('REVENUE'), backgroundColor: 'rgba(100,106,232,0.2)', borderColor: 'rgb(139,92,246)', borderWidth: 1, data: this.data4Data }]
        };
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

    this.apiService.getStatusMetrics().subscribe({
      next: (response: StatusMetrics) => {
        this.statusMetrics = response;
        Object.entries(response).forEach(([key, value]) => {
          this.data3Labels.push(this.translate.instant(`EVENT_STATUS_${key.toUpperCase()}`));
          this.data3Data.push(value);
        });
        this.data3 = { labels: this.data3Labels, datasets: [{ data: this.data3Data,  backgroundColor: ['rgba(100,106,232, 0.2)', 'rgba(126, 230, 78, 0.2)', 'rgba(180, 180, 180, 0.2)', 'rgba(233, 99, 141, 0.2)'],
              hoverBackgroundColor: ['rgba(100,106,232, 0.4)', 'rgba(126, 230, 78, 0.4)', 'rgba(180, 180, 180, 0.4)', 'rgba(233, 99, 141, 0.4)'],
              borderColor: ['rgba(100,106,232, 0.7)', 'rgba(126, 230, 78, 0.7)', 'rgba(180, 180, 180, 0.7)', 'rgba(233, 99, 141, 0.7)'], }] };
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

    this.apiService.getCategoryMetrics().subscribe({
      next: (response: CategoryMetrics) => {
        this.catMetrics = response;
        Object.entries(response).forEach(([key, value]) => {
          this.data2Labels.push(this.translate.instant(`CATEGORYS.${key.toUpperCase()}`));
          this.data2Data.push(value);
        });
        this.data2 = { labels: this.data2Labels, datasets: [{ data: this.data2Data,               backgroundColor: [
                'rgba(100,106,232, 0.2)',  // Music
                'rgba(126, 230, 78, 0.2)', // Sports
                'rgba(180, 180, 180, 0.2)',// Entertainment
                'rgba(233, 99, 141, 0.2)', // Protest
                'rgba(255, 193, 7, 0.2)',  // Charity
                'rgba(23, 162, 184, 0.2)', // Business
                'rgba(153, 102, 255, 0.2)',// Culture
                'rgba(108, 117, 125, 0.2)' // Other
              ],
              hoverBackgroundColor: [
                'rgba(100,106,232, 0.4)',
                'rgba(126, 230, 78, 0.4)',
                'rgba(180, 180, 180, 0.4)',
                'rgba(233, 99, 141, 0.4)',
                'rgba(255, 193, 7, 0.4)',
                'rgba(23, 162, 184, 0.4)',
                'rgba(153, 102, 255, 0.4)',
                'rgba(108, 117, 125, 0.4)'
              ],
              borderColor: [
                'rgba(100,106,232, 0.7)',
                'rgba(126, 230, 78, 0.7)',
                'rgba(180, 180, 180, 0.7)',
                'rgba(233, 99, 141, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(108, 117, 125, 0.7)'
              ], }] };
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
      if(!this.locked)
      {
        this.sharedEvents.langChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.locked = true;
        this.ngOnInit();
        
        // Ažuriraj grafikone
      });
      }
      
  }
  locked = false;
  createEvent() {
    this.router.navigate(["/organizer/create-event"], { queryParams: { showID: 3 } });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'unqualified': return 'danger';
      case 'qualified': return 'success';
      case 'new': return 'info';
      case 'negotiation': return 'warn';
      case 'renewal': return null;
      default: return null;
    }
  }
}
