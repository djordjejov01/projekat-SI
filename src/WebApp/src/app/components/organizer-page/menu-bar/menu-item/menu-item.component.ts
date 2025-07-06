import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-menu-item',
  imports: [TranslateModule, RouterLink],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css'
})
export class MenuItemComponent {
@Input() image : string;
@Input() title : string;
@Input() imageWhite: string;
@Input() link: string;
  @Input() isSelected: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}

