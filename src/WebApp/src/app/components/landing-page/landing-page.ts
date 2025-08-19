import { AfterViewInit, Component } from '@angular/core';
import { HeaderBar } from './header-bar/header-bar';
import { Banner } from './banner/banner';
import { Info } from './info/info';
import { PromoBanner } from './promo-banner/promo-banner';
import { FooterBar } from './footer-bar/footer-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-landing-page',
  imports: [TranslateModule,HeaderBar, Banner, Info, PromoBanner, FooterBar,ToastModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements AfterViewInit{

  constructor(private messageService : MessageService){}

  ngAfterViewInit(): void {
    if (sessionStorage.getItem('accessDenied') === 'true') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Access Denied',
      detail: 'You do not have permission to view that page.'
    });
    sessionStorage.removeItem('accessDenied');
  }
  }
  
}
