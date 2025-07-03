import { TestBed } from '@angular/core/testing';

import { Ledger } from './ledger';

describe('Ledger', () => {
  let service: Ledger;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ledger);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
