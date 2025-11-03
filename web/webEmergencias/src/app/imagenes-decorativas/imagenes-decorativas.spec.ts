import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenesDecorativas } from './imagenes-decorativas';

describe('ImagenesDecorativas', () => {
  let component: ImagenesDecorativas;
  let fixture: ComponentFixture<ImagenesDecorativas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagenesDecorativas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagenesDecorativas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
