import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const prevencionIDORGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  const tieneAcceso = await auth.puedeEntrar()

  if(tieneAcceso){
    return true
  } else {
    console.warn("Intento de acceso no autorizado")
    router.navigate(['/login'])
    return false
  }
};
