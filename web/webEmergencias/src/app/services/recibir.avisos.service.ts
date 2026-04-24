import { Injectable, inject } from '@angular/core';
import { query } from '@angular/fire/database';
import { 
  Firestore, 
  collection, 
  collectionData, 
  orderBy,
  CollectionReference,
  doc,
  updateDoc
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

  // FUNCIÓN PARA ACTUALIZAR UN INCIDENTE
  actualizarIncidente(id: string, data: any) {
    const docRef = doc(this.firestore, 'Emergencias', id);
    return updateDoc(docRef, data);
  }
  
}
