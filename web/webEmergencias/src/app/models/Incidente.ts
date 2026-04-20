/**
 * Emergency case as seen by the Dashboard.
 *
 * Matches the shape written by the Android App to `Emergencias/{caseId}` in
 * Firestore (see `app_tfg/Case.kt`). Field names are kept identical to the
 * Android data class so documents deserialise 1:1 without translation.
 *
 *   - `status`            "Ongoing" | "Finished"   (case lifecycle)
 *   - `finishRequestedBy` uid of the Unit that pressed btnCaseFinished, "" if none
 *   - `finishRequestedAt` Firestore Timestamp of that request, null if none
 */
export interface Incidente {
  id: string;                 // Firestore doc id (populated via idField: 'id')
  nombreCompleto: string;
  numeroTelefono: string;
  codigoSanguineo?: string;
  description: string;
  type?: string;
  date?: string;
  location?: string;

  status: 'Ongoing' | 'Finished' | string;
  finishRequestedBy: string;
  finishRequestedAt: any | null;   // Firestore Timestamp | null

  // Optional context fields the App writes
  victim?: string;
  workers?: string[];
  latitude?: number;
  longitude?: number;
}
