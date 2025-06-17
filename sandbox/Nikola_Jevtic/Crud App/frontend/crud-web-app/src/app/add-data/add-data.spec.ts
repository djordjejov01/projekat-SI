import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddData } from './add-data';

describe('AddData', () => {
  let component: AddData;
  let fixture: ComponentFixture<AddData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
