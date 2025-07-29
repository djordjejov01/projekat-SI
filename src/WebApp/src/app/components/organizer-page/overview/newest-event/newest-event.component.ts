import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Event } from '../../../../Models/Event';
@Component({
  selector: 'app-newest-event',
  imports: [TranslateModule],
  templateUrl: './newest-event.component.html',
  styleUrl: './newest-event.component.css'
})
export class NewestEventComponent {
  @Input() image : string;
  @Input() title : string;
  @Input() location: string;
  @Input() time: string;
  @Input() desc: string;
  @Input() event: Event;
  constructor(private router : Router){}
  manageEvent(event: Event){
      this.router.navigate(['/organizer/event-management', event.getEventId()])
    }
}
