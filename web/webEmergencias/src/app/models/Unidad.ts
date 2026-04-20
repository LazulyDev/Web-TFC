/**
 * Emergency unit as stored under `unidades/{uid}` in Realtime Database.
 *
 * Canonical `estado` vocabulary (written by the Android App):
 *   - "Online"        → free, assignable
 *   - "InActiveCase"  → has an active case (on its way, but not on scene yet)
 *   - "OnScene"       → arrived at the scene
 *   - "offline"       → app is closed / killed
 *
 * Any other value is considered legacy and should be treated as "offline".
 */
export interface Unidad {
    id: string;             // identificador de la unidad. ej: UPR-8027
    cuerpo: string;         // cuerpo al que pertenece la unidad. ej: SAMUR-PC
    tipoUnidad: string;     // tipo de la unidad. ej: UPR
    estado: 'Online' | 'InActiveCase' | 'OnScene' | 'offline' | string;
    cuentaUsuario: string;  // usuario conductor de la unidad: nombre@cargo.emergencias.com

    // Optional fields also stored in RTDB — surfaced here so the Dashboard
    // can cross-reference a unit with its active case.
    hasActiveCase?: boolean;
    currentCaseId?: string;
    latitude?: number;
    longitude?: number;
}
