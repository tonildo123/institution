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
  for (const own of [true, false]) {
    const uid = own ? 'sender' : 'outsider';
    const permitted = own || ['admin', 'equipo directivo'].includes(role);
    add(`${role}: ${own ? 'propio' : 'ajeno'}`, uid, role, 'get', permitted ? 'ALLOW' : 'DENY', { reporterId: 'sender' });
    cases[cases.length - 1].test.request.path = '/databases/(default)/documents/problemReports/report';
    add(`${role}: comentarios ${own ? 'propios' : 'ajenos'}`, uid, role, 'get', permitted ? 'ALLOW' : 'DENY');
    const entry = cases[cases.length - 1].test;
    entry.request.path = '/databases/(default)/documents/problemReports/report/comments/comment';
    entry.functionMocks = [
      { function: 'get', args: [{ exactValue: '/databases/(default)/documents/users/' + uid }], result: { value: { data: { role, isEnabled: true } } } },
      { function: 'get', args: [{ exactValue: '/databases/(default)/documents/problemReports/report' }], result: { value: { data: { reporterId: 'sender' } } } },
    ];
  }
  add(`${role}: no cambia descripción`, 'sender', role, 'update', 'DENY', { reporterId: 'sender', description: 'Original' }, { reporterId: 'sender', description: 'Cambio' });
  cases[cases.length - 1].test.request.path = '/databases/(default)/documents/problemReports/report';
}
for (const uid of [null, 'sender']) {
  add('sin sesión o deshabilitado', uid, 'familia', 'get', 'DENY', { reporterId: 'sender' }, { reporterId: 'sender' }, false);
  cases[cases.length - 1].test.request.path = '/databases/(default)/documents/problemReports/report';
}
const rulesFile = 'firestore.rules';
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
