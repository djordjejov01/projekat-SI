import { Component } from '@angular/core';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { EventsComponent } from './events/events.component';
import { OverviewComponent } from './overview/overview.component';
import { RouterModule } from '@angular/router';
import { FooterBar } from '../landing-page/footer-bar/footer-bar';
import { SessionService } from '../../Services/session.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-organizer-page',
  imports: [MenuBarComponent, OverviewComponent,RouterModule, FooterBar,ConfirmDialogModule,ToastModule],
  templateUrl: './organizer-page.component.html',
  styleUrl: './organizer-page.component.css'
})
export class OrganizerPageComponent {


  constructor(private sessionService : SessionService){}

    onLogoutClick(){
    this.sessionService.logoutWithConfirmation();
  }
}
