import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  enviarAviso(unidadId: string, contenido: string, coordenadas: string) {
    const datosAviso = {
    mensaje: contenido,   // el cuerpo del mensaje que se va a mandar
    unidadID: unidadId      // 'unidadId' pasa a llamarse 'unidad'
  };

    console.log('Enviando aviso a unidad:', datosAviso);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.URLfirebase, datosAviso, { headers });
  }
}
