import { Component } from '@angular/core';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Input } from '@angular/core';
@Component({
  selector: 'app-menu-bar',
  imports: [MenuItemComponent, CommonModule, TranslateModule, RouterModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  selectedIndex = 0;
  @Input() items: any;
  lastItemIndex = 0;
  constructor(private router: Router, private route: ActivatedRoute) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const showID = params['showID'];
      if (showID) {
        this.selectedIndex = Number(showID);
        //console.log(this.selectedIndex)
      }
    });
    const currentRoute = this.router.url.split('/').pop();
    //console.log(currentRoute);
    const foundIndex = this.items.findIndex(item => item.link === currentRoute);
    if (foundIndex !== -1) {
      this.selectedIndex = foundIndex;
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.lastItemIndex = this.items.length - 1;
      const lastItem = document.getElementById(`item${this.lastItemIndex}`) as HTMLElement;
      if (lastItem) {
        lastItem.style.marginTop = "50px";
        lastItem.style.position = "absolute";
        lastItem.style.bottom = "0";
        lastItem.style.width = "100%";
      }
    });
  }
  selectItem(index: number) {
    this.selectedIndex = index;
  }

}