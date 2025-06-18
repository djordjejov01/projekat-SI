import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ProizvodiComponent } from './proizvodi/proizvodi.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HttpClientModule, ProizvodiComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'Proizvodi';
}
