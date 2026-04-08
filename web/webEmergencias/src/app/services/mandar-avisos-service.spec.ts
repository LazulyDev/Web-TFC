import { TestBed } from '@angular/core/testing';

import { MandarAvisosService } from './mandar-avisos-service';

describe('MandarAvisosService', () => {
  let service: MandarAvisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MandarAvisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
