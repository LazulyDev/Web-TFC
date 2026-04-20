export interface Unidad {
    id: string,             // identificador de la unidad. ej: UPR-8027
    cuerpo: string,         // cuerpo al que pertenece la unidad. ej: SAMUR-PC
    tipoUnidad: string,     // tipo de la unidad. ej: UPR
    estado: string,         // estado de la unidad. desactivada (estado por defecto) | activada | no disponible
    cuentaUsuario: string,  // usuario conductor de la unidad: nombre@cargo.emergencias.com
    latitude: number,        // latitud en la que está la unidad
    longitude: number       // longitude en la que está la unidad
}
