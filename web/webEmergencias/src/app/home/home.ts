import { Component } from '@angular/core';
import { PanelNavegacion } from "../panel-navegacion/panel-navegacion";
import { Header } from "../header/header";
import { About } from "../about/about";
import { InfoServicios } from "../info-servicios/info-servicios";
import { ImagenesDecorativas } from "../imagenes-decorativas/imagenes-decorativas";

@Component({
  selector: 'app-home',
  imports: [PanelNavegacion, Header, About, InfoServicios, ImagenesDecorativas],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
}
