import { TestBed } from '@angular/core/testing';

import { NuevaUnidadService } from './nueva-unidad-service';

describe('NuevaUnidadService', () => {
  let service: NuevaUnidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NuevaUnidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
