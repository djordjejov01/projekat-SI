import { Component , EventEmitter, Input, Output, output} from '@angular/core';
import { Anime } from '../../services/anime';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-text-input',
  imports: [FormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css'
})
export class TextInput {

  @Input() ph? : string;

  value: string = "";
  @Output() valueChange = new EventEmitter<string>();

  onInput(){
    this.valueChange.emit(this.value)
  }
}
