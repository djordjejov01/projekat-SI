import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityModalComponent } from './activity-modal.component';

describe('ActivityModalComponent', () => {
  let component: ActivityModalComponent;
  let fixture: ComponentFixture<ActivityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
