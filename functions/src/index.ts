/**
 * Cloud Functions para Institución App
 * v1 gen 1 con onRequest
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Inicializar Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const messaging = getMessaging(app);

const COLLECTIONS = {
  USERS: 'users',
  COMMUNICATIONS: 'communications',
};

/**
 * Utilidad: Configurar CORS
 */
function setCORS(res: any) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Enviar comunicación a TODOS los usuarios
 */
export const sendCommunicationToAll = functions.https.onRequest(
  async (req, res) => {
    setCORS(res);
    if (req.method === 'OPTIONS') {
      res.status(200).send('OK');
      return;
    }

    try {
      const { title, body, description, data: additionalData, userId } = req.body;

      if (!title || !body || !userId) {
        res.status(400).json({ error: 'title, body y userId requeridos' });
        return;
      }

      console.log(`📤 Enviando comunicación a TODOS los usuarios...`);

      const communicationRef = db.collection(COLLECTIONS.COMMUNICATIONS).doc();
      const now = new Date().toISOString();

      await communicationRef.set({
        id: communicationRef.id,
        title,
        description: description || body,
        body,
        sentBy: userId,
        sentAt: now,
        status: 'enviado',
        totalUsers: 0,
        deliveredCount: 0,
        failedCount: 0,
        data: additionalData || {},
        createdAt: now,
        updatedAt: now,
      });

      const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
      console.log('✅ Total de usuarios:', usersSnapshot.size);

      let successCount = 0;
      let failCount = 0;
      const invalidTokens: any[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const pushTokens = userData?.pushTokens || [];

        if (pushTokens.length === 0) {
          failCount++;
          continue;
        }

        for (const tokenObj of pushTokens) {
          const token = typeof tokenObj === 'string' ? tokenObj : tokenObj.token;
          if (!token) continue;

          try {
            await messaging.send({
              token,
              notification: {
                title,
                body,
              },
              data: {
                ...additionalData,
                communicationId: communicationRef.id,
              },
              android: {
                priority: 'high',
              },
            });

            successCount++;
          } catch (error: any) {
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push({ userId: userDoc.id, token });
            }
            failCount++;
          }
        }
      }

      if (invalidTokens.length > 0) {
        for (const { userId: docUserId, token } of invalidTokens) {
          const userRef = db.collection(COLLECTIONS.USERS).doc(docUserId);
          const userDoc = await userRef.get();
          const userData = userDoc.data();
          const pushTokens = (userData?.pushTokens || []).filter(
            (t: any) => (typeof t === 'string' ? t : t.token) !== token
          );
          await userRef.update({ pushTokens });
        }
      }

      await communicationRef.update({
        totalUsers: usersSnapshot.size,
        deliveredCount: successCount,
        failedCount: failCount,
        updatedAt: now,
      });

      res.json({
        success: true,
        communicationId: communicationRef.id,
        totalUsers: usersSnapshot.size,
        delivered: successCount,
        failed: failCount,
        message: `✅ Comunicación enviada a ${successCount}/${usersSnapshot.size} usuarios`,
      });
    } catch (error: any) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error enviando comunicación',
      });
    }
  }
);

/**
 * Enviar comunicación a usuarios específicos (por sala/nivel)
 */
export const sendCommunicationToUsers = functions.https.onRequest(
  async (req, res) => {
    setCORS(res);
    if (req.method === 'OPTIONS') {
      res.status(200).send('OK');
      return;
    }

    try {
      const { title, body, description, data: additionalData, userId, userIds } = req.body;

      if (!title || !body || !userId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({ error: 'title, body, userId y userIds (array no vacío) requeridos' });
        return;
      }

      console.log(`📤 Enviando comunicación a ${userIds.length} usuarios específicos...`);
      console.log('👥 IDs:', JSON.stringify(userIds));

      const communicationRef = db.collection(COLLECTIONS.COMMUNICATIONS).doc();
      const now = new Date().toISOString();

      console.log('📝 Creando documento de comunicación...');

      await communicationRef.set({
        id: communicationRef.id,
        title,
        description: description || body,
        body,
        sentBy: userId,
        sentAt: now,
        status: 'enviado',
        totalUsers: 0,
        deliveredCount: 0,
        failedCount: 0,
        data: additionalData || {},
        createdAt: now,
        updatedAt: now,
      });

      console.log('📋 Construyendo query de usuarios...');

      // Obtener SOLO los usuarios en la lista
      let usersSnapshot;
      try {
        usersSnapshot = await db.collection(COLLECTIONS.USERS)
          .where(FieldPath.documentId(), 'in', userIds)
          .get();
      } catch (queryError: any) {
        console.error('❌ Error en query:', queryError.message || queryError);
        throw queryError;
      }

      console.log(`✅ Usuarios encontrados: ${usersSnapshot.size}/${userIds.length}`);

      let successCount = 0;
      let failCount = 0;
      const invalidTokens: any[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const pushTokens = userData?.pushTokens || [];

        if (pushTokens.length === 0) {
          failCount++;
          continue;
        }

        for (const tokenObj of pushTokens) {
          const token = typeof tokenObj === 'string' ? tokenObj : tokenObj.token;
          if (!token) continue;

          try {
            await messaging.send({
              token,
              notification: {
                title,
                body,
              },
              data: {
                ...additionalData,
                communicationId: communicationRef.id,
              },
              android: {
                priority: 'high',
              },
            });

            successCount++;
          } catch (error: any) {
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push({ userId: userDoc.id, token });
            }
            failCount++;
          }
        }
      }

      if (invalidTokens.length > 0) {
        for (const { userId: docUserId, token } of invalidTokens) {
          const userRef = db.collection(COLLECTIONS.USERS).doc(docUserId);
          const userDoc = await userRef.get();
          const userData = userDoc.data();
          const pushTokens = (userData?.pushTokens || []).filter(
            (t: any) => (typeof t === 'string' ? t : t.token) !== token
          );
          await userRef.update({ pushTokens });
        }
      }

      await communicationRef.update({
        totalUsers: usersSnapshot.size,
        deliveredCount: successCount,
        failedCount: failCount,
        updatedAt: now,
      });

      res.json({
        success: true,
        communicationId: communicationRef.id,
        totalUsers: usersSnapshot.size,
        delivered: successCount,
        failed: failCount,
        message: `✅ Comunicación enviada a ${successCount}/${usersSnapshot.size} usuarios`,
      });
    } catch (error: any) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error enviando comunicación',
      });
    }
  }
);

/**
 * Health check
 */
export const healthCheck = functions.https.onRequest(
  async (req, res) => {
    setCORS(res);

    if (req.method === 'OPTIONS') {
      res.status(200).send('OK');
      return;
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Cloud Functions activas ✅',
    });
  }
);
