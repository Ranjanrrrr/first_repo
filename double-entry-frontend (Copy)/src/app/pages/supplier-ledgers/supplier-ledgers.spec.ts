import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierLedgers } from './supplier-ledgers';

describe('SupplierLedgers', () => {
  let component: SupplierLedgers;
  let fixture: ComponentFixture<SupplierLedgers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierLedgers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierLedgers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
