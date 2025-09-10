import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketFailComponent } from './ticket-fail.component';

describe('TicketFailComponent', () => {
  let component: TicketFailComponent;
  let fixture: ComponentFixture<TicketFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketFailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
