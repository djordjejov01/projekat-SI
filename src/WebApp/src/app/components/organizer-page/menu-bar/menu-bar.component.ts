import { Component} from '@angular/core';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-menu-bar',
  imports: [MenuItemComponent, CommonModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  selectedIndex = 0;
  items = [{ title: 'Events', image: './assets/calendar.svg', imageWhite: './assets/calendarWhite.svg'},
      { title: 'Calendar', image: './assets/calendar.svg', imageWhite: './assets/calendarWhite.svg' },
      { title: 'Create Event', image: './assets/plus.svg', imageWhite: './assets/plusWhite.svg' },
      { title: 'My profile', image: './assets/profile.svg', imageWhite: './assets/profileWhite.svg' }]
  selectItem(index: number)
  {
    this.selectedIndex = index;
  }

}