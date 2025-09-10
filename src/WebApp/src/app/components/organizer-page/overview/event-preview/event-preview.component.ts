import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Event } from '../../../../Models/Event';
import { AuthService } from '../../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-preview',
  imports: [TranslateModule, CommonModule],
  templateUrl: './event-preview.component.html',
  styleUrls: ['./event-preview.component.css']
})
export class EventPreviewComponent implements OnInit {

  @Input() event: Event;
  currentUser: string;
  translatedStatus: string;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserName();
    this.translateStatus();
    // Re-translate if language changes dynamically
    this.translateService.onLangChange.subscribe(() => {
      this.translateStatus();
    });
  }

  manageEvent(event: Event) {
    this.router.navigate(['/organizer/event-management', event.getEventId()]);
  }

  private translateStatus() {
    const statusKey = 'EVENT_STATUS_' + this.event.getStatusLabel().toUpperCase();
    this.translateService.get(statusKey).subscribe(translated => {
      this.translatedStatus = translated;
    });
  }
}
