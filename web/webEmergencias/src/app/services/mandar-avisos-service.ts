import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DatosAviso {
  unidadID: string;
  avisoID: string;
  mensaje: string;
  coordenadas: string;
}

@Injectable({
  providedIn: 'root',
})
export class MandarAvisosService {
  private URLfirebase = "https://enviaralerta-dbqkaboigq-uc.a.run.app";

  constructor(private http: HttpClient){}

  /**
   * @param unidadId    ID público de la unidad (ej: BOM-01) — se usa como topic FCM.
   * @param avisoID     ID del documento Firestore `Emergencias/{caseId}` — la app lo
   *                    necesita para hacer fetch del Case completo tras "ACEPTAR".
   * @param contenido   Texto corto para el cuerpo de la notificación.
   * @param coordenadas Coordenadas del aviso como string "lat,lng".
   */
  enviarAviso(unidadId: string, avisoID: string, contenido: string, coordenadas: string) {
    const datosAviso: DatosAviso = {
      unidadID: unidadId,
      avisoID: avisoID,
      mensaje: contenido,
      coordenadas: coordenadas,
    };

    console.log('Enviando aviso a unidad:', datosAviso);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.URLfirebase, datosAviso, { headers });
  }
}
