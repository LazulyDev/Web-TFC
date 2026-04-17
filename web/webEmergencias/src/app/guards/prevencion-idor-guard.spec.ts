import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { prevencionIDORGuard } from './prevencion-idor-guard';

describe('prevencionIDORGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => prevencionIDORGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
