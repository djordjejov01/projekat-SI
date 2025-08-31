import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-statistic-card',
  imports: [CommonModule,TranslateModule],
  templateUrl: './statistic-card.component.html',
  styleUrls: ['./statistic-card.component.css']
})
export class StatisticCard {

  @Input() cardTitle : string = "";
  @Input() statValue : number;
  @Input() statDesc : string = "";
  @Input() statPercent : number;
  @Input() imgUrl : string = "";

}
