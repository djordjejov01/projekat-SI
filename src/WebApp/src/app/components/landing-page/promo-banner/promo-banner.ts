import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-promo-banner',
  imports: [TranslateModule, RouterLink],
  templateUrl: './promo-banner.html',
  styleUrl: './promo-banner.css'
})
export class PromoBanner {

}
