import { inject, Injectable } from '@angular/core';
import { Database, ref, set, object, listVal, objectVal, update} from '@angular/fire/database';
import { Unidad } from '../models/Unidad';
import { EMPTY, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NuevaUnidadService {
  private bbdd = inject(Database)

  // FUNCIÓN PARA CREAR UNA NUEVA UNIDAD EN LA BASE DE DATOS
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
  
  // FUNCION PARA VER TODAS LAS UNIDADES A LA VEZ
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

  // FUNCIÓN PARA ELIMINAR INFORMACIÓN DE UNA UNIDAD.
  async eliminarInfoUnidad(unidadID : string){
    try {
      const unidadRef = ref(this.bbdd, `unidades/${unidadID}`)
      await update(unidadRef,{
        currentCaseId: "",
        hasActiveCase: false,
        estado: "Disponible"
      })
      console.log("Datos actualiados con éxito")
    } catch (error) {
      console.log(`error al actualizar las unidades: error -> ${error}`)
      throw error
    }
  }
}
