import { Component} from '@angular/core';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-bar',
  imports: [MenuItemComponent, CommonModule, TranslateModule, RouterModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  selectedIndex = 0;
  items = [{ title: 'OVERVIEW', image: './assets/eye.svg', imageWhite: './assets/eyeWhite.svg', link: "overview"},
    { title: 'EVENTS', image: './assets/calendar.svg', imageWhite: './assets/calendarWhite.svg', link: "events"},
      { title: 'CALENDAR', image: './assets/cal.svg', imageWhite: './assets/calWhite.svg' , link: "calendar"},
      { title: 'CREATE', image: './assets/plus.svg', imageWhite: './assets/plusWhite.svg' , link: "create-event"},
      { title: 'MYPROFILE', image: './assets/profile.svg', imageWhite: './assets/profileWhite.svg', link: "my-profile" }]
    
  constructor(private router: Router, private route : ActivatedRoute) {}
      ngOnInit() {
        this.route.queryParams.subscribe(params =>{
        const showID = params['showID'];
          if(showID)
          {
            this.selectedIndex = Number(showID);
            console.log(this.selectedIndex)
          }
      });
    const currentRoute = this.router.url.split('/').pop();
    console.log(currentRoute);
    const foundIndex = this.items.findIndex(item => item.link === currentRoute);
    if (foundIndex !== -1) {
      this.selectedIndex = foundIndex;
    }
  }
  
  selectItem(index: number)
  {
    this.selectedIndex = index;
  }

}