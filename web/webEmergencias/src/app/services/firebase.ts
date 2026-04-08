import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  static messaging() {
    throw new Error('Method not implemented.');
  }
  
}
