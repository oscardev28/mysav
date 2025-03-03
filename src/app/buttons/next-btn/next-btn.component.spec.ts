import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextBtnComponent } from './next-btn.component';

describe('NextBtnComponent', () => {
  let component: NextBtnComponent;
  let fixture: ComponentFixture<NextBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
