import { Routes } from '@angular/router';
import { Home } from './home/home';
import { InicioSesion } from './inicio-sesion/inicio-sesion';
import { Dashboard } from './dashboard/dashboard';
import { prevencionIDORGuard } from './guards/prevencion-idor-guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: "login", component: InicioSesion },

    // paths bloqueados por los guards 
    { 
        path: "dashboard", 
        component: Dashboard,
        canActivate: [prevencionIDORGuard]
    }
];
