import { Component } from '@angular/core';
import { NewestEventComponent } from './newest-event/newest-event.component';
import { EventPreviewComponent } from './event-preview/event-preview.component';

@Component({
  selector: 'app-overview',
  imports: [NewestEventComponent, EventPreviewComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
}
