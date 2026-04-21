import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface DatosAviso {
  unidadId: string;
  contenido: string;
  coordenadas: string;
}

@Injectable({
  providedIn: 'root',
})
export class MandarAvisosService {
  private URLfirebase = "https://enviaralerta-dbqkaboigq-uc.a.run.app";
  
  constructor(private http: HttpClient){}

  enviarAviso(unidadId: string, contenido: string, coordenadas: string, incidenciaID: String) {
    const datosAviso = {
    mensaje: contenido,        // el cuerpo del mensaje que se va a mandar
    unidadID: unidadId,        // La identificación de la unidad
    coordenadas: coordenadas,  // coordenadas del aviso
    incidenciaID: incidenciaID // identificador de la incidencia 
    };

    console.log('Enviando aviso a unidad:', datosAviso);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.URLfirebase, datosAviso, { headers });
  }

  // FUNCIÓN PARA MANDAR MÚLTIPLES AVISOS
  enviarMultiplesAvisos(unidadesID: string[], contenido: string, coordenadas: string, incidenciaID: String){
    console.log(`Mandando aviso la la(s) unidad(es): ${unidadesID}`)
    const peticiones = unidadesID.map(id => 
      this.enviarAviso(id, contenido, coordenadas, incidenciaID)
    );
    return forkJoin(peticiones); // forkjoin es un for each normal pero avanzado con capacidad de gestionar los errores.
  }
}
