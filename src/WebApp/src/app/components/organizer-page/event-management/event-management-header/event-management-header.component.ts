import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../../Services/api.service';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-event-management-header',
  imports: [TranslateModule,Breadcrumb, ButtonModule, CommonModule],
  templateUrl: './event-management-header.component.html',
  styleUrls: ['./event-management-header.component.css']
})
export class EventManagementHeaderComponent implements OnInit, OnChanges {

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  @Input() eventTitle: string;
  @Input() editMode!: boolean;
  @Input() parentEventId: number = 0;
  @Output() editModeChange = new EventEmitter<boolean>();
  @Input() eventID: number;
  @Input() eventInfo: EventBasicInfo;
  currStatus: string;
  @Output() eventAction = new EventEmitter<void>();

  private lastParentEventId: number | null = null;
  private parentEventTitle: string | null = null;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currStatus = this.eventInfo.getStatusLabel();
    this.updateBreadcrumb();
    this.home = undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentEventId']) {
      const newParentId = changes['parentEventId'].currentValue;
      if (newParentId !== 0 && newParentId != this.lastParentEventId) {
        this.fetchParentEventTitle(newParentId);
      } else {
        this.parentEventTitle = null;
        this.lastParentEventId = 0;
        this.updateBreadcrumb();
      }
    } else if (changes['eventTitle']) {
      this.updateBreadcrumb();
    }
  }

  private fetchParentEventTitle(parentId: number) {
    this.apiService.getEventBasicInfo(parentId).subscribe({
      next: (parentEvent) => {
        this.parentEventTitle = parentEvent.getTitle();
        this.lastParentEventId = parentId;
        this.updateBreadcrumb();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('EVENT.ERROR'),
          detail: error.message ?? this.translate.instant('EVENT.UNKNOWN_ERROR'),
          life: 3000
        });
        this.parentEventTitle = null;
        this.lastParentEventId = null;
        this.updateBreadcrumb();
      }
    });
  }

  private updateBreadcrumb() {
    if (this.parentEventTitle) {
      this.items = [
        { label: this.translate.instant('EVENT.EVENTS'), routerLink: '/organizer/overview' },
        { label: this.parentEventTitle, routerLink: `/organizer/event-management/${this.lastParentEventId}` },
        { label: this.eventTitle }
      ];
    } else {
      this.items = [
        { label: this.translate.instant('EVENT.EVENTS'), routerLink: '/organizer/overview' },
        { label: this.eventTitle }
      ];
    }
  }

  onEditClick() {
    this.editModeChange.emit(true);
  }

  async publishEvent() {
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('EVENT.CONFIRM_PUBLISH'),
      this.translate.instant('EVENT.PUBLISH')
    );
    if (!confirmed) return;

    this.apiService.publishEvent(this.eventID).subscribe({
      next: (response: any) => {
        this.currStatus = "Published";
        this.eventAction.emit();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('EVENT.SUCCESS'),
          detail: response.message,
          life: 3000
        });
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('EVENT.ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  async cancelEvent() {
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('EVENT.CONFIRM_CANCEL'),
      this.translate.instant('EVENT.CANCEL')
    );
    if (!confirmed) return;

    this.apiService.cancelEvent(this.eventID).subscribe({
      next: (response: any) => {
        this.currStatus = "Canceled";
        this.eventAction.emit();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('EVENT.SUCCESS'),
          detail: response.message,
          life: 3000
        });
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('EVENT.ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  async deleteEvent() {
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('EVENT.CONFIRM_DELETE'),
      this.translate.instant('EVENT.DELETE')
    );
    if (!confirmed) return;

    this.apiService.deleteEvent(this.eventID).subscribe({
      next: (response: any) => {
        this.router.navigate(['/organizer']);
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

}
