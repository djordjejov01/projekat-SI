import { Component, numberAttribute, OnInit } from '@angular/core';
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
import { AfterContentInit, AfterViewInit, HostListener, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { UIChart } from 'primeng/chart'
import { TableLazyLoadEvent } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Toast } from 'primeng/toast';
import { RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DashboardMetrics } from '../../../Interfaces/DashboardMetricsResponse';
import { StatusMetrics } from '../../../Interfaces/StatusMetricsResponse';
import { CategoryMetrics } from '../../../Interfaces/CategoryMetricsResponse';
import { CategoryService } from '../../../Services/EventCategoryService';
import { MonthlyMetrics } from '../../../Interfaces/MonthlyMetricsResponse';

@Component({
  selector: 'app-events',
  imports: [CommonModule, ChartModule, TableModule, ButtonModule,
    CommonModule, MultiSelectModule, InputTextModule, DropdownModule, FormsModule, IconField, InputIcon, TableModule, ConfirmDialogModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {

  selectedCategories: any[] = [];
  selectedStatus: any[] = [];
  categories = [
    { name: 'Music', value: 'Music' },
    { name: 'Sports', value: 'Sports' },
    { name: 'Entertainment', value: 'Entertainment' },
    { name: 'Protest', value: 'Protest' },
    { name: 'Charity', value: 'Charity' },
    { name: 'Business', value: 'Business' },
    { name: 'Culture', value: 'Culture' },
    { name: 'Other', value: 'Other' }
  ];
  statuses = [
    { name: "Draft", value: "Draft" },
    { name: "Published", value: "Published" },
    { name: "Canceled", value: "Canceled" }
  ];
  onRoleFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedCategories = selectedOptions || [];

    // Extract the 'value' strings to pass to the filter callback
    const filterValues = this.selectedCategories.map(role => role.value);

    filterFn(filterValues.length ? filterValues : null);
  }
  loading: boolean = true;

  activityValues: number[] = [0, 100];
  allEvents: Event[];
  selectedEvents: Event[];
  dashboardMetrics: DashboardMetrics;
  statusMetrics: StatusMetrics;
  monthlyMetrics: MonthlyMetrics[];
  searchValue: string;
  currUser: string;
  constructor(private apiService: ApiService, private authService: AuthService, private messageService: MessageService,
    private router: Router, private catSer: CategoryService) { }
  clear(table: Table) {
    table.clear();
    this.selectedEvents = [];
    this.selectedCategories = [];
    this.selectedStatus = [];
    this.searchValue = "";
  }
  value: any[] = [];
  roles = [
    { name: 'Admin', value: 'Admin' },
    { name: 'Organizer', value: 'Organizer' },
    { name: 'Supplier', value: 'Supplier' },
  ];


  options1 = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#495057',
          stepSize: 1
        },
        grid: {
          color: '#ebedef'
        }
      }
    }
  };
  options2 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#495057'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mesec',
          color: '#333'
        },
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Broj događaja',
          color: '#333'
        },
        beginAtZero: true,
        ticks: {
          color: '#495057',
          stepSize: 1
        },
        grid: {
          color: '#ebedef'
        }
      }
    }
  };
  data3;
  data2;
  data1;
  data4;
  data4Labels: any[] = [];
  data1Labels: any[] = [];
  data3Labels: any[] = [];
  data2Labels: any[] = [];
  data3Data: any[] = [];
  data2Data: any[] = [];
  data1Data: any[] = [];
  data4Data: any[] = [];
  options3 = {
    responsive: true,
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

  viewEvent(eID: number) {
    alert(eID);
  }
  editEvent(eID: number) {
    alert(eID);
  }
  deleteEvent(eID: number) {
    alert(eID);
  }

  getCatName(catID: number) {
    return this.catSer.getCategoryName(catID);
  }

  ngOnInit() {
    this.currUser = this.authService.getUserName();
    this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({

      next: (response: Event[]) => {
        this.allEvents = response;
        this.loading = false;
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



    this.apiService.getDashboardMetrics().subscribe({
      next: (response: DashboardMetrics) => {
        this.dashboardMetrics = response;
        console.log(response);
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

    this.apiService.getMonthlyMetrics(this.authService.getUserId(), 2025).subscribe({
      next: (response: MonthlyMetrics[]) => {
        this.monthlyMetrics = response;
        console.log(response);
        for (const [key, value] of Object.entries(response)) {
          for (const [key1, value1] of Object.entries(value)) {
            if(key1 == "month")
            {
              this.data1Labels.push(value1);
              this.data4Labels.push(value1);
            }
            if(key1 == "visitors")
            {
              this.data1Data.push(value1);
            }
            if(key1 == "revenue")
            {
              this.data4Data.push(value1);
            }
        }
        }

        this.data1 = {
          labels: this.data1Labels,
          datasets: [
            {
              label: 'Prihod',
              backgroundColor: 'rgba(100,106,232, 0.2)',
              borderColor: 'rgb(139, 92, 246)',
              borderWidth: 1,
              data: this.data1Data
            }
          ]
        };
        this.data4 = {
          labels: this.data4Labels,
          datasets: [
            {
              label: 'Posetioci',
              backgroundColor: 'rgba(100,106,232, 0.2)',
              borderColor: 'rgb(139, 92, 246)',
              borderWidth: 1,
              data: this.data4Data
            }
          ]
        };
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


    this.apiService.getStatusMetrics().subscribe({
      next: (response: StatusMetrics) => {
        this.statusMetrics = response;
        for (const [key, value] of Object.entries(response)) {
          this.data3Labels.push(key);
          this.data3Data.push(value);
        }
        this.data3 = {
          labels: this.data3Labels,
          datasets: [
            {
              data: this.data3Data,
              backgroundColor: ['rgba(100,106,232, 0.2)', 'rgba(126, 230, 78, 0.2)', 'rgba(180, 180, 180, 0.2)', 'rgba(233, 99, 141, 0.2)'],
              hoverBackgroundColor: ['rgba(100,106,232, 0.4)', 'rgba(126, 230, 78, 0.4)', 'rgba(180, 180, 180, 0.4)', 'rgba(233, 99, 141, 0.4)'],
              borderColor: ['rgba(100,106,232, 0.7)', 'rgba(126, 230, 78, 0.7)', 'rgba(180, 180, 180, 0.7)', 'rgba(233, 99, 141, 0.7)'],
              borderWidth: 1
            }
          ]
        };
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


    this.apiService.getCategoryMetrics().subscribe({
      next: (response: CategoryMetrics) => {
        for (const [key, value] of Object.entries(response)) {
          this.data2Labels.push(key);
          this.data2Data.push(value);
        }
        this.data2 = {
          labels: this.data2Labels,
          datasets: [
            {
              data: this.data2Data,
              backgroundColor: ['rgba(100,106,232, 0.2)', 'rgba(126, 230, 78, 0.2)', 'rgba(180, 180, 180, 0.2)', 'rgba(233, 99, 141, 0.2)'],
              hoverBackgroundColor: ['rgba(100,106,232, 0.4)', 'rgba(126, 230, 78, 0.4)', 'rgba(180, 180, 180, 0.4)', 'rgba(233, 99, 141, 0.4)'],
              borderColor: ['rgba(100,106,232, 0.7)', 'rgba(126, 230, 78, 0.7)', 'rgba(180, 180, 180, 0.7)', 'rgba(233, 99, 141, 0.7)'],
              borderWidth: 1
            }
          ]
        };
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

  createEvent() {
    this.router.navigate(["/organizer/create-event"], {
      queryParams: { showID: 3 }
    });

  }
  getSeverity(status: string) {
    switch (status) {
      case 'unqualified':
        return 'danger';

      case 'qualified':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warn';

      case 'renewal':
        return null;
      default:
        return null;
    }
  }
}
