import { Component} from '@angular/core';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-menu-bar',
  imports: [MenuItemComponent, CommonModule, TranslateModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  selectedIndex = 0;
  items = [{ title: 'OVERVIEW', image: './assets/eye.svg', imageWhite: './assets/eyeWhite.svg'},
    { title: 'EVENTS', image: './assets/calendar.svg', imageWhite: './assets/calendarWhite.svg'},
      { title: 'CALENDAR', image: './assets/cal.svg', imageWhite: './assets/calWhite.svg' },
      { title: 'CREATE', image: './assets/plus.svg', imageWhite: './assets/plusWhite.svg' },
      { title: 'MYPROFILE', image: './assets/profile.svg', imageWhite: './assets/profileWhite.svg' }]
  selectItem(index: number)
  {
    this.selectedIndex = index;
  }

}