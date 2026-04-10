import { TestBed } from '@angular/core/testing';

import { RecibirAvisosService } from './recibir.avisos.service';

describe('RecibirAvisosService', () => {
  let service: RecibirAvisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecibirAvisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
