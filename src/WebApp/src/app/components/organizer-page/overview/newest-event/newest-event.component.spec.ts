import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewestEventComponent } from './newest-event.component';

describe('NewestEventComponent', () => {
  let component: NewestEventComponent;
  let fixture: ComponentFixture<NewestEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewestEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewestEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
