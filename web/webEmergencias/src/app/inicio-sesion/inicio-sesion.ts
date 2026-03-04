import { Component, OnInit, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true, // Importante si usas Angular 17+
  imports: [],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router)

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
  
  async iniciarSesion(usrname: string, pswd: string): Promise<void> {
    const esLoginCorrecto = await this.authService.login(usrname, pswd);
    if (esLoginCorrecto) {
      console.log("usuario y contraseña correctas")
      this.router.navigate(['/dashboard'])
    } else {
      console.error("Error al iniciar sesión. usuario o contraseña incorrecta.")
    }
  }
}
