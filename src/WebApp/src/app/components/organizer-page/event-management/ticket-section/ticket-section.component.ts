import { Component } from '@angular/core';
import { MOCK_TICKETS, Ticket } from '../../../../MockData/MockTickets';
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

@Component({
  selector: 'app-ticket-section',
  imports: [TableModule,ButtonModule,MultiSelectModule,InputTextModule,DropdownModule,FormsModule,InputIcon,IconField,TooltipModule, DatePipe],
  templateUrl: './ticket-section.component.html',
  styleUrl: './ticket-section.component.css'
})
export class TicketSectionComponent {


  tickets : Ticket[] = MOCK_TICKETS;
  selectedTickets : Ticket [] = [];
  loading: boolean = false;
  searchValue : string = '';

  clear(table: Table) {
    table.clear();
    this.selectedTickets = []
    this.searchValue = '';
  }

}
