import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'WebApp';

    constructor(private translate: TranslateService) {
    translate.addLangs(['sr', 'en']);
    translate.setDefaultLang('sr');
    translate.use('sr');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

}
