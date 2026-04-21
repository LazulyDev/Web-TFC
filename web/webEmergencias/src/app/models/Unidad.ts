export interface Unidad {
    UID?: string,           // id real de firebase
    id: string,             // id visible tipo BOM-01
    cuerpo: string,
    tipoUnidad: string,
    estado: string,
    cuentaUsuario: string,
    latitude?: number,
    longitude?: number,
    currentCaseId?: string,
    hasActiveCase?: boolean,
}