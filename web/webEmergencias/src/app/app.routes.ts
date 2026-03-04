import { Routes } from '@angular/router';
//import path from 'node:path';
import { Home } from './home/home';
import { InicioSesion } from './inicio-sesion/inicio-sesion';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: "login", component: InicioSesion },
    { path: "dashboard", component: Dashboard }
];
