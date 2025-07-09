import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalBookComponent } from './journal-book';

describe('JournalBook', () => {
  let component: JournalBookComponent;
  let fixture: ComponentFixture<JournalBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
