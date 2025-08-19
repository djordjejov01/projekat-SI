import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Event } from '../../../../Models/Event';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../Services/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-event-preview',
  imports: [TranslateModule,DatePipe, CommonModule],
  templateUrl: './event-preview.component.html',
  styleUrl: './event-preview.component.css'
})
export class EventPreviewComponent implements OnInit{
  // @Input() title: string;
  // @Input() status: string;
  // @Input() time: string;
  // @Input() host: string;
  // @Input() location: string;
  // @Input() image: string;
  @Input() event : Event;
  currentUser : string;

  constructor(private router : Router, private authService : AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
  }

  manageEvent(event: Event){
    this.router.navigate(['/organizer/event-management', event.getEventId()])
  }
}
