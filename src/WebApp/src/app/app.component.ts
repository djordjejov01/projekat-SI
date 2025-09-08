import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';
import { filter } from 'rxjs';
import { LanguageService } from './Services/LanguageService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  title = 'WebApp';

    constructor(private translate: TranslateService,private router: Router, private languageService : LanguageService) {
    const storedLang = this.languageService.language();
    translate.addLangs(['sr', 'en']);

    const langToUse = storedLang || 'sr';
    this.translate.setDefaultLang(langToUse);
    this.translate.use(langToUse);

    this.languageService.setLanguage(langToUse);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

}
