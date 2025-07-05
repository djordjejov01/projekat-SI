import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-event-preview',
  imports: [TranslateModule],
  templateUrl: './event-preview.component.html',
  styleUrl: './event-preview.component.css'
})
export class EventPreviewComponent {
  @Input() title: string;
  @Input() status: string;
  @Input() time: string;
  @Input() host: string;
  @Input() location: string;
  @Input() image: string;
}
