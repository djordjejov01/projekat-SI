import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-event-management-header',
  imports: [Breadcrumb,ButtonModule],
  templateUrl: './event-management-header.component.html',
  styleUrl: './event-management-header.component.css'
})
export class EventManagementHeaderComponent implements OnInit{

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  @Input() eventTitle : string;
  @Input() editMode!: boolean;
  @Output() editModeChange = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.items = [
      { label: 'Events', routerLink: '/organizer/overview' },
      // Optional: Add subevent breadcrumb if needed
      { label: this.eventTitle }
    ];

    this.home = undefined; // DON'T use the `home` property
  }

  onEditClick(){
    this.editModeChange.emit(true);
  }

}
