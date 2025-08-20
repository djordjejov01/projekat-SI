import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticCard } from './statistic-card.component';

describe('StatisticCardComponent', () => {
  let component: StatisticCard;
  let fixture: ComponentFixture<StatisticCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
