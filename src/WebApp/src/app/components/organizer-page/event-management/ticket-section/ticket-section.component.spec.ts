import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSectionComponent } from './ticket-section.component';

describe('TicketSectionComponent', () => {
  let component: TicketSectionComponent;
  let fixture: ComponentFixture<TicketSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
