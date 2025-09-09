import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { PendingRequest } from "../../../../Interfaces/PendingRequestApiResponse";
import { ApiService } from '../../../../Services/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule
  ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css',
  providers: [MessageService]
})
export class RequestsComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() supplierId: number | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() requestProcessed = new EventEmitter<void>();
  @Output() pendingRequestCount = new EventEmitter<number>();

  pendingRequests: PendingRequest[] = [];
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
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
        this.pendingRequestCount.emit(this.pendingRequests.length);
      },
      error: (error) => {
        console.error('Error fetching pending requests:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: this.translate.instant('REQUESTS.ERROR_FETCH'),
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.visibleChange.emit(false);
    this.modalClosed.emit();
  }

  openModal(): void {
    this.visible = true;
  }

  approveRequest(request: PendingRequest): void {
    this.loading = true;
    this.apiService.updateEventResourceStatus(request.id, EventResourceStatus.Approved).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('REQUESTS.APPROVED'),
          life: 3000
        });
        this.fetchPendingRequests();
        this.requestProcessed.emit();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: err.error || this.translate.instant('REQUESTS.APPROVE_FAILED'),
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  declineRequest(request: PendingRequest): void {
    this.loading = true;
    this.apiService.updateEventResourceStatus(request.id, EventResourceStatus.Declined).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('REQUESTS.DECLINED'),
          life: 3000
        });
        this.fetchPendingRequests();
        this.requestProcessed.emit();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: err.error || this.translate.instant('REQUESTS.DECLINE_FAILED'),
          life: 3000
        });
        this.loading = false;
      }
    });
  }
}
