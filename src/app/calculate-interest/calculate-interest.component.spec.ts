import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateInterestComponent } from './calculate-interest.component';

describe('CalculateInterestComponent', () => {
  let component: CalculateInterestComponent;
  let fixture: ComponentFixture<CalculateInterestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateInterestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
