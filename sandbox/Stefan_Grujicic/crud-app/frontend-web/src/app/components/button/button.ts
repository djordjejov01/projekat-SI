import { Component, Input , Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  @Input() text?: string;
  @Output() btnClick = new EventEmitter();


  onClick() {
    this.btnClick.emit();
  }
}
