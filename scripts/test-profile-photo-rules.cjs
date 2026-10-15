const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const cli = fs.realpathSync(execFileSync('which', ['firebase'], { encoding: 'utf8' }).trim());
const auth = require(path.resolve(path.dirname(cli), '../auth.js'));
const photo = { size: 1024, contentType: 'image/jpeg' };
const scenarios = [
  ['propietario sube foto', 'self', 'create', true, photo, 'ALLOW'],
  ['otra cuenta no sube', 'other', 'create', true, photo, 'DENY'],
  ['sin sesión no sube', null, 'create', true, photo, 'DENY'],
  ['cuenta deshabilitada no sube', 'self', 'create', false, photo, 'DENY'],
  ['PDF no permitido', 'self', 'create', true, { ...photo, contentType: 'application/pdf' }, 'DENY'],
  ['archivo vacío no permitido', 'self', 'create', true, { ...photo, size: 0 }, 'DENY'],
  ['máximo 5 MB', 'self', 'create', true, { ...photo, size: 6 * 1024 * 1024 }, 'DENY'],
  ['propietario lee', 'self', 'get', true, photo, 'ALLOW'],
  ['otra cuenta no lee directamente', 'other', 'get', true, photo, 'DENY'],
  ['propietario actualiza', 'self', 'update', true, photo, 'ALLOW'],
];
(async () => {
  const account = auth.getGlobalDefaultAccount();
  const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  const response = await fetch('https://firebaserules.googleapis.com/v1/projects/institucion-59d9a:test', {
    method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: { files: [{ name: 'storage.rules', content: fs.readFileSync(path.resolve(__dirname, '../storage.rules'), 'utf8') }] },
      testSuite: { testCases: scenarios.map(([, uid, method, enabled, resource, expectation]) => ({ expectation,
        request: { path: '/b/bucket/o/profile-photos/self/avatar', method, auth: uid ? { uid, token: {} } : null, resource }, resource,
        functionMocks: [{ function: 'firestore.get', args: [{ anyValue: {} }], result: { value: { data: { isEnabled: enabled, role: 'familia' } } } }],
      })) } }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(result));
  const failed = (result.testResults || []).flatMap((test, index) => test.state === 'SUCCESS' ? [] : [{ name: scenarios[index][0], ...test }]);
  if (!result.testResults?.length || failed.length) throw new Error(JSON.stringify(failed.length ? failed : result));
  console.log(`${result.testResults.length} pruebas de fotos de perfil aprobadas.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
