import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true, // Importante si usas Angular 17+
  imports: [],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  fondoSeleccionado: string = '';

  listaFondos: string[] = [
    '/img/inicio-sesion/rescate.jpg',
    '/img/inicio-sesion/helicoptero.jpg',
    '/img/inicio-sesion/luces-policia2.jpg',
    '/img/inicio-sesion/samur.jpeg',
    'img/inicio-sesion/ambulancias.jpg',
  ];

  // se ejecuta cuando el componente se inicia
  ngOnInit(): void {
    this.fondoSeleccionado = this.elegirFondoAleatorio();
  }

  // escoje el fondo que tiene que mostrar
  elegirFondoAleatorio(): string {
    const indice = Math.floor(Math.random() * this.listaFondos.length);
    return this.listaFondos[indice];
  }

  // estraccion de la información para el inicio de sesión
  usr= (nombre: string) => {
    if(nombre.includes("@") || nombre.includes(".com")){
      return nombre
    } else return null
  }

  pswd: string = ""

  // inicio de sesión
}