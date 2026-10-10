import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

// Un único destinatario obligatorio; no consulta usuarios ni usa topics.
const deviceToken = process.env.FCM_DEVICE_TOKEN;
if (!deviceToken || /\s/.test(deviceToken)) {
  console.error('Definí FCM_DEVICE_TOKEN con un único token FCM.');
  process.exit(1);
}

try {
  let accessToken;
  if (process.env.FCM_AUTH_SOURCE === 'firebase-cli') {
    // Usa la sesión local del CLI instalado; no imprime ni guarda credenciales.
    const cliPath = realpathSync(execFileSync('which', ['firebase'], { encoding: 'utf8' }).trim());
    const require = createRequire(import.meta.url);
    const auth = require(resolve(dirname(cliPath), '../auth.js'));
    const account = auth.getGlobalDefaultAccount();
    if (!account) throw new Error('Iniciá sesión con firebase login.');
    const credentials = await auth.getAccessToken(account.tokens.refresh_token, [
      'https://www.googleapis.com/auth/cloud-platform',
    ]);
    accessToken = credentials.access_token;
  } else {
    accessToken = execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    }).trim();
  }

  const response = await fetch(
    'https://fcm.googleapis.com/v1/projects/institucion-59d9a/messages:send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: {
            title: 'IMEP · Prueba desde script',
            body: 'Esta notificación fue enviada únicamente a tu iPhone.',
          },
          data: { type: 'test' },
          apns: {
            headers: { 'apns-push-type': 'alert', 'apns-priority': '10' },
            payload: { aps: { sound: 'default' } },
          },
        },
      }),
      signal: AbortSignal.timeout(30000),
    },
  );
  const result = await response.json();
  if (!response.ok) {
    console.error(`FCM rechazó el envío (${response.status}):`, result.error?.message);
    process.exitCode = 1;
  } else {
    console.log('FCM aceptó el envío a un único dispositivo:', result.name);
  }
} catch (error) {
  console.error('No se pudo enviar la prueba:', error.message);
  process.exitCode = 1;
}
