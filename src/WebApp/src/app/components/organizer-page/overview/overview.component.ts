import { Component } from '@angular/core';
import { NewestEventComponent } from './newest-event/newest-event.component';
import { EventPreviewComponent } from './event-preview/event-preview.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-overview',
  imports: [NewestEventComponent, EventPreviewComponent, TranslateModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
}
