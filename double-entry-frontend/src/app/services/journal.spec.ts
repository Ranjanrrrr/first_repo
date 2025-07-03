import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalService } from './journal';

describe('Journal', () => {
  let component: JournalService;
  let fixture: ComponentFixture<JournalService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
