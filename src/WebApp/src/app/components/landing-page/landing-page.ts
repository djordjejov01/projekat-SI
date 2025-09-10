import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { HeaderBar } from './header-bar/header-bar';
import { Banner } from './banner/banner';
import { Info } from './info/info';
import { PromoBanner } from './promo-banner/promo-banner';
import { FooterBar } from './footer-bar/footer-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  imports: [TranslateModule,HeaderBar, Banner, Info, PromoBanner, FooterBar,ToastModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements AfterViewInit, OnDestroy {

  private langChangeSubscription: Subscription | undefined;

  constructor(private messageService: MessageService, private translateService: TranslateService) {}

  ngAfterViewInit(): void {
    if (sessionStorage.getItem('accessDenied') === 'true') {
      setTimeout(() => {
        this.showLocalizedToast();
      }, 0);
    }
  }
  
  private showLocalizedToast(): void {
    // We only show the toast if the flag is still present
    if (sessionStorage.getItem('accessDenied') === 'true') {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('AUTH_GUARD.ACCESS_DENIED_SUMMARY'),
        detail: this.translateService.instant('AUTH_GUARD.ACCESS_DENIED_DETAIL'),
        life: 3000
      });
      sessionStorage.removeItem('accessDenied');
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}
