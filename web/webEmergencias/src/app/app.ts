import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanelNavegacion } from "./panel-navegacion/panel-navegacion";
import { Header } from "./header/header";
import { About } from "./about/about";
import { InfoServicios } from "./info-servicios/info-servicios";
import { ImagenesDecorativas } from "./imagenes-decorativas/imagenes-decorativas";
import { InicioSesion } from "./inicio-sesion/inicio-sesion";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PanelNavegacion, Header, About, InfoServicios, ImagenesDecorativas, InicioSesion],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('webEmergencias');
}
