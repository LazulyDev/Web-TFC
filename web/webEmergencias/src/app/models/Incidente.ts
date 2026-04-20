/**
 * Emergency case as seen by the Dashboard.
 *
 * Matches the shape written by the Android App to `Emergencias/{caseId}` in Firestore.
 *
 *   - `status`            "Ongoing" | "Finished"   (case lifecycle)
 *   - `finishRequestedBy` uid of the Unit that pressed btnCaseFinished, "" if none
 *   - `finishRequestedAt` Firestore Timestamp of that request, null if none
 */
export interface Incidente {
  id: string;
  identificador: number;
  nombreCompleto: string;
  telefono: string;
  tipoSangre?: string;
  descripcionEmergencia: string;

  status: 'Ongoing' | 'Finished' | string;
  finishRequestedBy: string;
  finishRequestedAt: any | null;   // Firestore Timestamp | null

  // Optional context fields the App writes
  victim?: string;
  workers?: string[];
  latitude?: number;
  longitude?: number;
}
