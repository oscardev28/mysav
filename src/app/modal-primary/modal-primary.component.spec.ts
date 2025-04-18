import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPrimaryComponent } from './modal-primary.component';

describe('ModalPrimaryComponent', () => {
  let component: ModalPrimaryComponent;
  let fixture: ComponentFixture<ModalPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPrimaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
