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

  // FUNCIÓN GUARD PARA VERIFICAR QUE EL USUARIO PUEDE ENTRAR EN LA DASHBOARD
  async puedeEntrar(): Promise<boolean>{
    const usuarioUID = this.obtenerUserUID()

    if(usuarioUID != null){
      return true
    }

    return false
  }

  obtenerUserUID(): string | null{ // adquiere el uid del usuario
    return this.auth.currentUser ? this.auth.currentUser.uid : null
  }
}
