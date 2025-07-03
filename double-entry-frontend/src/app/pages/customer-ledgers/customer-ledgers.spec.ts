import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLedgers } from './customer-ledgers';

describe('CustomerLedgers', () => {
  let component: CustomerLedgers;
  let fixture: ComponentFixture<CustomerLedgers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLedgers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerLedgers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
