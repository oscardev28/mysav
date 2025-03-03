import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoGastosComponent } from './grafico-gastos.component';

describe('GraficoGastosComponent', () => {
  let component: GraficoGastosComponent;
  let fixture: ComponentFixture<GraficoGastosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoGastosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
