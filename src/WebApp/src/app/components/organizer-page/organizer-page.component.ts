import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RouterModule } from '@angular/router';
import { FooterBar } from '../landing-page/footer-bar/footer-bar';
import { SessionService } from '../../Services/session.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-organizer-page',
  imports: [MenuBarComponent,RouterModule,ConfirmDialogModule,ToastModule,TranslateModule,Toast],
  templateUrl: './organizer-page.component.html',
  styleUrl: './organizer-page.component.css'
})
export class OrganizerPageComponent implements AfterContentInit{

  constructor(
    private sessionService : SessionService,
    private translate: TranslateService,
    private messageService : MessageService,
    private authService : AuthService,
    private cd : ChangeDetectorRef){}

  ngAfterContentInit(): void {
    this.cd.detectChanges(); // Ensure view is fully initialized

    const shouldShowWelcome = sessionStorage.getItem('showWelcome') === 'true';
    if (shouldShowWelcome) {
      const name = this.authService.getUserName();
      if (name) {
        this.messageService.add({
          severity: 'success',
          summary: 'Welcome',
          detail: `Welcome back, ${name}!`,
          life: 3000
        });
      }
      sessionStorage.removeItem('showWelcome');
    }
  }


    onLogoutClick(){
    this.sessionService.logoutWithConfirmation();
  }

    changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translate.use(lang);
  }
}
