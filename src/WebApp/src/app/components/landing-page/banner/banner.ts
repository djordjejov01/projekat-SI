import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-banner',
  imports: [TranslateModule, RouterLink, RouterModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {
  scrollToPosition() {
  window.scrollTo({
    top: 830,
    behavior: 'smooth'
  });
}
}
