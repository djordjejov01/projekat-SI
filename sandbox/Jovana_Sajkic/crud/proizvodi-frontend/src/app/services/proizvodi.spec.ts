import { TestBed } from '@angular/core/testing';

import { Proizvodi } from './proizvodi';

describe('Proizvodi', () => {
  let service: Proizvodi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Proizvodi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
