import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  async login(email: string, password: string): Promise<boolean> {
    try{
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Usuario logueado:', userCredential.user.email);
      return true;

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error; // Re-lanzar el error para que pueda ser manejado por el componente
    }
  } 

  // función para crear un nuevo usuario con email y contraseña
  async register(email: string, password: string): Promise<boolean> {
    return true;
  }
}
