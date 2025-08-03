import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubeventModalComponent } from './subevent-modal.component';

describe('SubeventModalComponent', () => {
  let component: SubeventModalComponent;
  let fixture: ComponentFixture<SubeventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubeventModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubeventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
