import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-banner',
  imports: [TranslateModule, RouterLink],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {

}
