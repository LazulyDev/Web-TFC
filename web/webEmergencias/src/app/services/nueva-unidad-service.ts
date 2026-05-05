import { inject, Injectable } from '@angular/core';
import { Database, ref, set, listVal, update } from '@angular/fire/database';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Unidad } from '../models/Unidad';
import { EMPTY, firstValueFrom, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NuevaUnidadService {
  private bbdd = inject(Database);
  private firestore = inject(Firestore);

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
      
      // actualiza el estado de las unidades
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

  async eliminarInfoUsuario(emergenciaUID: string) {
    if (!emergenciaUID) {
      console.error("emergenciaUID es nulo o indefinido");
      return;
    }

    try {
      const emergenciaDocRef = doc(this.firestore, 'Emergencias', emergenciaUID);
      const docSnap = await getDoc(emergenciaDocRef);

      if (!docSnap.exists()) {
        console.warn(`La emergencia Firestore ${emergenciaUID} no existe.`);
        return;
      }

      const data = docSnap.data() as { [key: string]: any };
      if (!data || !data['victim']) {
        console.warn(`La emergencia existe pero no tiene un campo 'victim'.`, data);
        return;
      }

      const victimUID = String(data['victim']);
      const usuarioRef = ref(this.bbdd, `usuarios/${victimUID}`);

      await update(usuarioRef, {
        currentCaseId: "",
        hasActiveCase: false,
      });

      console.log(`Usuario ${victimUID} actualizado correctamente.`);
    } catch (error) {
      console.error(`Error en eliminarInfoUsuario:`, error);
      throw error;
    }
  }
}
