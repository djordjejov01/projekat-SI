import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-events',
  imports: [CommonModule,ChartModule,TableModule, ButtonModule,
      CommonModule, MultiSelectModule, InputTextModule, DropdownModule, FormsModule,IconField, InputIcon,TableModule,ConfirmDialogModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {

    statuses!: any[];

    loading: boolean = true;

    activityValues: number[] = [0, 100];
    allEvents : Event[];
    selectedEvents: Event[];
    searchValue : string;
      currUser : string;
    constructor(private apiService : ApiService, private authService : AuthService, private messageService : MessageService,
    private router : Router) {}
    clear(table: Table) {
        table.clear();
        this.selectedEvents = [];
        this.searchValue = "";
      }  
    value: any[] = [];
    roles = [
  { name: 'Admin', value: 'Admin'},
  { name: 'Organizer', value: 'Organizer' },
  { name: 'Supplier', value: 'Supplier' },
  // Add all roles you have
];
    data1 = {
      labels: [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ],
      datasets: [
        {
          label: 'Broj događaja',
          backgroundColor: '#42A5F5',
          data: [1,3,5,2,6,3,7,10,3,9,7,4]
        }
      ]
    };

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
    viewEvent(eID : number)
    {
      alert(eID);
    }
    editEvent(eID : number)
    {
      alert(eID);
    }
    deleteEvent(eID : number)
    {
      alert(eID);
    }
    ngOnInit() {
        this.currUser = this.authService.getUserName();
              this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
              
                      next:(response : Event[]) => {
                        this.allEvents = response;
                        this.loading = false;
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

        this.statuses = [
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ];
    }
    createEvent(){
    this.router.navigate(["/organizer/create-event"],{
        queryParams: { showID: 3}
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
