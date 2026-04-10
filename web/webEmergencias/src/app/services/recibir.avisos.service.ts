import { Injectable, inject } from '@angular/core';
import { query } from '@angular/fire/database';
import { 
  Firestore, 
  collection, 
  collectionData, 
  orderBy,
  CollectionReference
} from '@angular/fire/firestore';
import { or } from '@angular/fire/firestore/lite';
import { error } from 'console';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecibirAvisosService {
  private firestore: Firestore = inject(Firestore)

  // FUNCIÓN PARA VER TODOS LOS AVISOS A LA VEZ
  verAvisos() :Observable<any>{
    const referencia = collection(this.firestore, 'Emergencias')
    const datos = collectionData(referencia, { idField: 'id' })
    console.log("Avisos recopilados con éxito")

    return datos
  }
  
}
