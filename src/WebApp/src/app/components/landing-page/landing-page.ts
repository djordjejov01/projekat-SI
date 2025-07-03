import { Component } from '@angular/core';
import { HeaderBar } from './header-bar/header-bar';
import { Banner } from './banner/banner';
import { Info } from './info/info';
import { PromoBanner } from './promo-banner/promo-banner';
import { FooterBar } from './footer-bar/footer-bar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-page',
  imports: [TranslateModule,HeaderBar, Banner, Info, PromoBanner, FooterBar],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {

}
