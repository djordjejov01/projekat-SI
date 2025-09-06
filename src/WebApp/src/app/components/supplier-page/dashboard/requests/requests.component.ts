// requests.component.ts

import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { PendingRequest } from "../../../../Interfaces/PendingRequestApiResponse";
import { ApiService } from '../../../../Services/api.service';

enum EventResourceStatus {
  Pending,
  Approved,
  Declined
}

@Component({
  selector: 'app-requests',
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    ButtonModule,
  ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css',
  providers: [MessageService] // Add MessageService provider
})


// Implement the OnChanges lifecycle hook
export class RequestsComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>(); // Add this line
  @Input() supplierId: number | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() requestProcessed = new EventEmitter<void>();
  @Output() pendingRequestCount = new EventEmitter<number>();

  pendingRequests: PendingRequest[] = [];
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

 ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'visible' property has changed and is now true
    // and if the 'supplierId' has a valid value.
    if (changes['visible'] && changes['visible'].currentValue === true && this.supplierId) {
      this.fetchPendingRequests();
    }
  }

  fetchPendingRequests(): void {
    if (!this.supplierId) {
      console.error('Supplier ID is missing. Cannot fetch requests.');
      return;
    }

    this.loading = true;
    this.apiService.getPendingEventResources(this.supplierId).subscribe({
      next: (data) => {
        this.pendingRequests = data;
        this.loading = false;
        //console.log('Fetched pending requests:', this.pendingRequests);
        this.pendingRequestCount.emit(this.pendingRequests.length); 
      },
      error: (error) => {
        console.error('Error fetching pending requests:', error);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Could not load pending requests.',life: 3000});
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.visibleChange.emit(false); // Emit the change to the parent
    this.modalClosed.emit();
  }

  openModal()
  {
    this.visible = true;
  }

// Update the approveRequest method
  approveRequest(request: PendingRequest): void {
    this.loading = true;
    this.apiService.updateEventResourceStatus(request.id, EventResourceStatus.Approved)
      .subscribe({
        next: (response) => {
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Request approved!',life: 3000});
          // After success, re-fetch the pending requests to update the table
          this.fetchPendingRequests();
          this.requestProcessed.emit();
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: err.error || 'Failed to approve request.',life: 3000});
          this.loading = false;
        }
      });
  }

  // Update the declineRequest method
  declineRequest(request: PendingRequest): void {
    this.loading = true;
    this.apiService.updateEventResourceStatus(request.id, EventResourceStatus.Declined)
      .subscribe({
        next: (response) => {
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Request declined!',life: 3000});
          // After success, re-fetch the pending requests to update the table
          this.fetchPendingRequests();
          this.requestProcessed.emit();
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: err.error || 'Failed to decline request.',life: 3000});
          this.loading = false;
        }
      });
  }
}