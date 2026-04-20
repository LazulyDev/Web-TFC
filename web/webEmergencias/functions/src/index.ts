import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

admin.initializeApp();
const corsMiddleware = cors({origin: true});

export const enviarAlerta = functions.https.onRequest((req, res) => {
  return corsMiddleware(req, res, async () => {
    const {mensaje, unidadID, coordenadas, incidenciaID} = req.body;

    // mensaje a enviar
    const payload = {
      topic: unidadID,
      data: {
        aviso: mensaje,
        unidadID: unidadID,
        coordenadas: coordenadas,
        incidenciaID: incidenciaID,
      },
      android: {
        priority: "high" as const,
      },
    };

    try {
      await admin.messaging().send(payload);
      res.status(200).send({enviado: true});
    } catch (error: unknown) {
      res.status(500).send({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
});
