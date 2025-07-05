import { Component } from '@angular/core';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { EventsComponent } from './events/events.component';
import { OverviewComponent } from './overview/overview.component';
import { RouterModule } from '@angular/router';
import { FooterBar } from '../landing-page/footer-bar/footer-bar';
@Component({
  selector: 'app-organizer-page',
  imports: [MenuBarComponent, OverviewComponent,RouterModule, FooterBar],
  templateUrl: './organizer-page.component.html',
  styleUrl: './organizer-page.component.css'
})
export class OrganizerPageComponent {

}
