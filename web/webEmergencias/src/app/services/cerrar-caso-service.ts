import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  writeBatch,
  serverTimestamp
} from '@angular/fire/firestore';
import { Database, ref, update } from '@angular/fire/database';

/**
 * Finalises an emergency case. This is the ONLY place that should mark a
 * case as "Finished" — the Android App can only *request* closure via the
 * btnCaseFinished button, which writes finishRequestedBy/At on the Case.
 *
 * Writes performed:
 *   Firestore (batched, atomic):
 *     Emergencias/{caseId}.status       = "Finished"
 *     Emergencias/{caseId}.finishedAt   = serverTimestamp
 *     usuarios/{victim}.hasActiveCase   = false
 *     usuarios/{victim}.currentCaseId   = ""
 *
 *   Realtime DB (per unit — can't share a batch with Firestore):
 *     unidades/{uid}.estado         = "Online"
 *     unidades/{uid}.hasActiveCase  = false
 *     unidades/{uid}.currentCaseId  = ""
 */
@Injectable({
  providedIn: 'root',
})
export class CerrarCasoService {
  private firestore: Firestore = inject(Firestore);
  private rtdb: Database = inject(Database);

  async cerrarCaso(caseId: string, workers: string[], victim: string): Promise<void> {
    // 1) Firestore — case + victim user, atomic
    const batch = writeBatch(this.firestore);

    const caseRef = doc(this.firestore, 'Emergencias', caseId);
    batch.update(caseRef, {
      status: 'Finished',
      finishedAt: serverTimestamp(),
      // Clear the request fields so the banner disappears and the doc is
      // tidy in case anyone re-opens it later.
      finishRequestedBy: '',
      finishRequestedAt: null
    });

    if (victim && victim.length > 0) {
      const victimRef = doc(this.firestore, 'usuarios', victim);
      batch.update(victimRef, {
        hasActiveCase: false,
        currentCaseId: ''
      });
    }

    await batch.commit();

    // 2) RTDB — free every assigned unit. Run in parallel.
    const unitUpdates = (workers ?? []).map((uid) => {
      if (!uid) return Promise.resolve();
      const unitRef = ref(this.rtdb, `unidades/${uid}`);
      return update(unitRef, {
        estado: 'Online',
        hasActiveCase: false,
        currentCaseId: ''
      });
    });

    await Promise.all(unitUpdates);
  }
}
