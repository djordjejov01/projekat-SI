import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBasicInfoComponent } from './event-basic-info.component';

describe('EventBasicInfoComponent', () => {
  let component: EventBasicInfoComponent;
  let fixture: ComponentFixture<EventBasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventBasicInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
