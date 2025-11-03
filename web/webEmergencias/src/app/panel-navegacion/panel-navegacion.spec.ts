import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelNavegacion } from './panel-navegacion';

describe('PanelNavegacion', () => {
  let component: PanelNavegacion;
  let fixture: ComponentFixture<PanelNavegacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelNavegacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelNavegacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
