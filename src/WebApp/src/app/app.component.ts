import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  title = 'WebApp';

    constructor(private translate: TranslateService,private router: Router) {
    translate.addLangs(['sr', 'en']);
    translate.setDefaultLang('sr');
    translate.use('sr');
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
