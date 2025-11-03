import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoServicios } from './info-servicios';

describe('InfoServicios', () => {
  let component: InfoServicios;
  let fixture: ComponentFixture<InfoServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoServicios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
