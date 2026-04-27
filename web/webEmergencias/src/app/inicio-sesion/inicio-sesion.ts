import { Component, OnInit, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [NgIf],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  private authService = inject(AuthService);  // servicio de autenticación de Firebase Auth
  private router = inject(Router)             // servicio para el uso de rutas dentro de la web
  errorLogin = false                          // esta variable sirve para diferenciar si el login es correcto o no.

  fondoSeleccionado: string = '';

  listaFondos: string[] = [
    '/img/inicio-sesion/rescate.jpg',
    '/img/inicio-sesion/helicoptero.jpg',
    '/img/inicio-sesion/luces-policia2.jpg',
    '/img/inicio-sesion/samur.jpeg',
    'img/inicio-sesion/ambulancias.jpg',
    'img/inicio-sesion/madrid.jpeg',
    'img/inicio-sesion/uniforme.jpeg',
    'img/inicio-sesion/retrovisor.jpeg',
    'img/inicio-sesion/psa.jpeg'
  ];

  ngOnInit(): void {
    this.fondoSeleccionado = this.elegirFondoAleatorio();
  }

  // ESCOJE EL FONDO QUE VA A MOSTRAR
  elegirFondoAleatorio(): string {
    const indice = Math.floor(Math.random() * this.listaFondos.length);
    return this.listaFondos[indice];
  }

  // ESTRACCIÓN DE INFORMACIÓN PARA EL INICIO DE SESISÓN
  usr= (nombre: string) => {
    if(nombre.includes("@") || nombre.includes(".com")){
      return nombre
    } else return null
  }

  pswd: string = ""

  // INICIO DE SESIÓN
  async iniciarSesion(usrname: string, pswd: string): Promise<void> {
    try {
      const esLoginCorrecto = await this.authService.login(usrname, pswd);
      this.errorLogin = false
      if (esLoginCorrecto) {
      console.log("usuario y contraseña correctas")
      this.router.navigate(['/dashboard'])
      }

    } catch (error) {
      this.errorLogin = true 
      console.error(`error al iniciar sesión ${error}`)
    }
  }
}
