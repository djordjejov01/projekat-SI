import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventManagementHeaderComponent } from './event-management-header.component';

describe('EventManagementHeaderComponent', () => {
  let component: EventManagementHeaderComponent;
  let fixture: ComponentFixture<EventManagementHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventManagementHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventManagementHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
