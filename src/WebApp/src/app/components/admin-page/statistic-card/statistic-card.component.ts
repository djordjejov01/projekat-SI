import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistic-card',
  imports: [CommonModule],
  templateUrl: './statistic-card.component.html',
  styleUrl: './statistic-card.component.css'
})
export class StatisticCard {

  @Input() cardTitle : string = "";
  @Input() statValue : number;
  @Input() statDesc : string = "";
  @Input() statPercent : number;
  @Input() imgUrl : string = "";

}
