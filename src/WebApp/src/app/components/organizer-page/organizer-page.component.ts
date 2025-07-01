import { Component } from '@angular/core';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { EventsComponent } from './events/events.component';
import { OverviewComponent } from './overview/overview.component';
@Component({
  selector: 'app-organizer-page',
  imports: [MenuBarComponent, EventsComponent, OverviewComponent],
  templateUrl: './organizer-page.component.html',
  styleUrl: './organizer-page.component.css'
})
export class OrganizerPageComponent {

}
