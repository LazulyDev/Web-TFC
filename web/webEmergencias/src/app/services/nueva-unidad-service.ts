import { inject, Injectable } from '@angular/core';
import { Database, ref, set, object, listVal, objectVal} from '@angular/fire/database';
import { Unidad } from '../models/Unidad';
import { EMPTY, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NuevaUnidadService {
  private bbdd = inject(Database)

  // función para crear una nueva unidad en la base de datos
  nuevaUnidad(unidad: Unidad){
    try {
      const unidadRef = ref(this.bbdd, `unidades/${unidad.id}`)
      console.log("envio de datos exitoso")
      return set(unidadRef, unidad)
    } catch (error) {
      console.log(`error al enviar datos a la base de datos: ${error}`)
      return unidad
    }
  }
  
  // funcion para ver todas la unidades a la vez
  verUnidades(): Observable<Unidad[]>{
    try {
      const todasLasUnidadesRef=  ref(this.bbdd, 'unidades')
      console.log("recepción de todas las unidades exitosa")
      return listVal<Unidad>(todasLasUnidadesRef)

    } catch (error) {
      console.log(`error al extraer los datos de todas las unidades: ${error}`)
      return throwError( () => new Error('No se pudo conectar con el servidor de emergencias'))
    }
  }

  // funcion para buscar una sola unidad
  buscarUnidadPorId(){}
}
