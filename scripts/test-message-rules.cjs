// Valida las reglas con Firebase Rules API, sin modificar datos ni publicar reglas.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const cli = fs.realpathSync(execFileSync('which', ['firebase'], { encoding: 'utf8' }).trim());
const auth = require(path.resolve(path.dirname(cli), '../auth.js'));
const message = { sentBy: 'sender', targetUserIds: ['recipient'], title: 'Privado', body: 'Contenido', description: 'Contenido', updatedAt: 'before' };
const cases = [];
function add(name, uid, role, method, expectation, data = message, after = data, enabled = true) {
  cases.push({ name, test: {
    expectation,
    request: { path: '/databases/(default)/documents/communications/message', method, auth: uid ? { uid, token: {} } : null, resource: { data: after } },
    resource: { data },
    functionMocks: [{ function: 'get', args: [{ anyValue: {} }], result: { value: { data: { role, isEnabled: enabled } } } }],
  } });
}
for (const role of ['admin', 'equipo directivo', 'representante legal', 'preceptor', 'familia']) {
  add(`${role}: emisor`, 'sender', role, 'get', 'ALLOW');
  add(`${role}: destinatario`, 'recipient', role, 'get', 'ALLOW');
  add(`${role}: ajeno`, 'outsider', role, 'get', 'DENY');
}
add('sin sesión', null, 'familia', 'get', 'DENY');
add('deshabilitado', 'recipient', 'familia', 'get', 'DENY', message, message, false);
add('antiguo sin destinatarios: solo emisor', 'outsider', 'admin', 'get', 'DENY', { sentBy: 'sender', level: 'todos' });
add('administrador ajeno no elimina', 'outsider', 'admin', 'delete', 'DENY');
add('administrador participante elimina', 'sender', 'admin', 'delete', 'ALLOW');
add('familia participante no elimina', 'recipient', 'familia', 'delete', 'DENY');
add('no se puede ampliar destinatarios', 'sender', 'admin', 'update', 'DENY', message, { ...message, targetUserIds: ['recipient', 'outsider'] });
add('edición conserva audiencia', 'sender', 'admin', 'update', 'ALLOW', message, { ...message, title: 'Corregido', updatedAt: 'after' });
const sending = process.argv.includes('--sending');
if (sending) {
  cases.length = 0;
  const resource = { teacherIds: ['other'], users: ['family'] };
  for (const role of ['preceptor', 'familia']) {
    add(`${role}: no se autoasigna`, 'sender', role, 'update', 'DENY', resource, { ...resource, teacherIds: ['sender'] });
    cases[cases.length - 1].test.request.path = '/databases/(default)/documents/salas/primario/cursos/grado-3-tt';
    add(`${role}: no se convierte en administrador`, 'sender', role, 'update', 'DENY', { role, isEnabled: true }, { role: 'admin', isEnabled: true });
    cases[cases.length - 1].test.request.path = '/databases/(default)/documents/users/sender';
    add(`${role}: no crea mensajes directamente`, 'sender', role, 'create', 'DENY');
  }
  for (const role of ['admin', 'equipo directivo', 'representante legal']) {
    add(`${role}: asigna docente`, 'sender', role, 'update', 'ALLOW', resource, { ...resource, teacherIds: ['sender'] });
    cases[cases.length - 1].test.request.path = '/databases/(default)/documents/salas/primario/cursos/grado-3-tt';
  }
  for (const role of ['admin', 'preceptor', 'familia', 'user']) {
    add(`registro propio con rol ${role}`, 'sender', 'user', 'create', role === 'user' ? 'ALLOW' : 'DENY', {}, { role });
    cases[cases.length - 1].test.request.path = '/databases/(default)/documents/users/sender';
  }
  add('la transición conserva la lectura anterior', null, 'familia', 'get', 'ALLOW');
}
add('docente elimina su propio mensaje', 'sender', 'preceptor', 'delete', 'ALLOW');
add('docente no elimina mensajes que solo recibe', 'recipient', 'preceptor', 'delete', 'DENY');
add('docente no elimina mensajes ajenos', 'outsider', 'preceptor', 'delete', 'DENY');
add('familia no elimina aunque figure como emisor', 'sender', 'familia', 'delete', 'DENY');
add('docente deshabilitado no elimina', 'sender', 'preceptor', 'delete', 'DENY', message, message, false);
for (const collection of ['biometricDevices', 'biometricAccounts', 'biometricChallenges']) {
  for (const method of ['get', 'create', 'update']) {
    add(`cliente no accede a ${collection}: ${method}`, 'sender', 'preceptor', method, 'DENY');
    cases[cases.length - 1].test.request.path = `/databases/(default)/documents/${collection}/sender`;
  }
  add(`administrador no cambia ${collection} directamente`, 'sender', 'admin', 'update', 'DENY');
  cases[cases.length - 1].test.request.path = `/databases/(default)/documents/${collection}/sender`;
}
const rulesFile = sending ? 'firestore.sending.rules' : 'firestore.rules';
(async () => {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Iniciá sesión con firebase login');
  const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  const response = await fetch('https://firebaserules.googleapis.com/v1/projects/institucion-59d9a:test', {
    method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: { files: [{ name: rulesFile, content: fs.readFileSync(path.join(root, rulesFile), 'utf8') }] }, testSuite: { testCases: cases.map(item => item.test) } }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(result));
  if (result.issues?.some(issue => issue.severity === 'ERROR')) throw new Error(JSON.stringify(result.issues));
  const failed = (result.testResults || []).flatMap((test, index) => test.state === 'SUCCESS' ? [] : [{ name: cases[index].name, ...test }]);
  if (!result.testResults?.length || failed.length) throw new Error(JSON.stringify(failed.length ? failed : result));
  console.log(`${result.testResults.length} pruebas de reglas aprobadas.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
