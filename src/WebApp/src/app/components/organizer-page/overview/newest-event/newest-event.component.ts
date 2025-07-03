import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-newest-event',
  imports: [],
  templateUrl: './newest-event.component.html',
  styleUrl: './newest-event.component.css'
})
export class NewestEventComponent {
  @Input() image : string;
  @Input() title : string;
  @Input() location: string;
  @Input() time: string;
  @Input() desc: string;
}
