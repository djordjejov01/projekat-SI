import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-event-management-header',
  imports: [Breadcrumb,ButtonModule],
  templateUrl: './event-management-header.component.html',
  styleUrl: './event-management-header.component.css'
})
export class EventManagementHeaderComponent implements OnInit, OnChanges{

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  @Input() eventTitle : string;
  @Input() editMode!: boolean;
  @Input() parentEventId : number = 0;
  @Output() editModeChange = new EventEmitter<boolean>();

  private lastParentEventId: number | null = null;
  private parentEventTitle: string | null = null;

   constructor(private apiService: ApiService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.updateBreadcrumb();
    this.home = undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes['parentEventId']){
        const newParentId = changes['parentEventId'].currentValue;

        if(newParentId !== 0 && newParentId  != this.lastParentEventId) this.fetchParentEventTitle(newParentId);
        else{
          this.parentEventTitle = null;
          this.lastParentEventId = 0;
          this.updateBreadcrumb()
        }
      }else if (changes['eventTitle']) this.updateBreadcrumb();
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
          summary: 'Error loading parent event',
          detail: error.message ?? 'Unknown error',
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
        { label: 'Events', routerLink: '/organizer/overview' },
        { label: this.parentEventTitle, routerLink: `/organizer/event/${this.lastParentEventId}` },
        { label: this.eventTitle }
      ];
    } else {
      this.items = [
        { label: 'Events', routerLink: '/organizer/overview' },
        { label: this.eventTitle }
      ];
    }
  }

  onEditClick(){
    this.editModeChange.emit(true);
  }

}

