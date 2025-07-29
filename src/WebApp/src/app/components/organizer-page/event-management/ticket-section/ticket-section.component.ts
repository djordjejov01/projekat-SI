import { Component, Input, OnInit } from '@angular/core';
import { Ticket } from '../../../../Models/Ticket';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';
import { ApiService } from '../../../../Services/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ticket-section',
  imports: [TableModule,ButtonModule,MultiSelectModule,InputTextModule,DropdownModule,FormsModule,InputIcon,IconField,TooltipModule, DatePipe,TicketModalComponent],
  templateUrl: './ticket-section.component.html',
  styleUrl: './ticket-section.component.css'
})
export class TicketSectionComponent implements OnInit{


  @Input() eventBasicInfo : EventBasicInfo;

  tickets : Ticket[] = [];
  selectedTickets : Ticket [] = [];
  loading: boolean = false;
  searchValue : string = '';

  constructor(private apiService : ApiService, private messageService : MessageService) {}

  ngOnInit(): void {
    this.loadTickets()
  }

  clear(table: Table) {
    table.clear();
    this.selectedTickets = []
    this.searchValue = '';
  }

  loadTickets() : void {
    if(!this.eventBasicInfo?.getEventID()) return;

    this.loading = true;
    this.apiService.getTicketsForEvent(this.eventBasicInfo.getEventID()).subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },

      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorResponse.message,
          life: 3000 });
        }

    })
  }

  onTicketCreated(){
    this.loadTickets()
  }

}
