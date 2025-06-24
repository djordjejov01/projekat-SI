import { Component } from '@angular/core';
import { InfoCard } from './info-card/info-card';
import { Input } from '@angular/core';
@Component({
  selector: 'app-info',
  imports: [InfoCard],
  templateUrl: './info.html',
  styleUrl: './info.css'
})
export class Info {
  @Input() title?: string;
  @Input() title1?: string;
  @Input() title2?: string;
  @Input() title3?: string;

  @Input() desc1?: string;
  @Input() desc2?: string;
  @Input() desc3?: string;

  @Input() image1?: string;
  @Input() image2?: string;
  @Input() image3?: string;
}
