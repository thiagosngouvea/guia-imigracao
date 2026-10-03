/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function loadTs(path, mocks = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const mod = new module.constructor(path, module);
  mod.filename = path;
  mod.paths = module.paths;
  mod.require = (id) => id in mocks ? mocks[id] : require(id);
  mod._compile(compiled, path);
  return mod.exports;
}

const guide = loadTs('src/lib/global-guide.ts');
const requestId = '11111111-1111-4111-8111-111111111111';
const profile = { goal: 'work', education: 'degree', occupation: 'engenharia', languages: ['Inglês'], savings: 'moderate', familyCountry: '', timeframe: 'year' };

function createHarness(balance, failCommit = false) {
  const records = new Map([['users/test-user', { credits: balance }]]);
  const ref = (key) => ({ key, collection: (name) => collection(`${key}/${name}`) });
  const collection = (key) => ({ doc: (id) => ref(`${key}/${id}`) });
  const db = {
    collection,
    runTransaction: async (callback) => {
      const staged = [];
      const tx = {
        get: async (document) => ({ exists: records.has(document.key), data: () => records.get(document.key) }),
        set: (document, data) => staged.push(['set', document.key, data]),
        update: (document, data) => staged.push(['update', document.key, data]),
      };
      const result = await callback(tx);
      if (failCommit) throw new Error('Simulated commit failure');
      for (const [action, key, data] of staged) records.set(key, action === 'update' ? { ...records.get(key), ...data } : data);
      return result;
    },
  };
  const { default: handler } = loadTs('src/pages/api/immigration-plans/index.ts', {
    'firebase-admin/firestore': { FieldValue: { serverTimestamp: () => 'timestamp' } },
    '../../../lib/server/firebase-admin': { adminDb: db },
    '../../../lib/server/auth': { requireAuth: async () => ({ uid: 'test-user' }) },
    '../../../lib/server/rate-limit': { enforceRateLimit: async () => true },
    '../../../lib/global-guide': guide,
  });
  async function post() {
    const req = { method: 'POST', body: { requestId, countryId: 'paraguai', routeId: 'py-mercosur', profile } };
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler(req, res);
    return res;
  }
  return { records, post };
}

test('saldo insuficiente não cria roteiro nem debita crédito', async () => {
  const { records, post } = createHarness(2);
  const response = await post();
  assert.equal(response.code, 402);
  assert.equal(records.get('users/test-user').credits, 2);
  assert.equal(records.size, 1);
});

test('criação e repetição usam um único débito e persistem o roteiro', async () => {
  const { records, post } = createHarness(5);
  assert.equal((await post()).code, 201);
  assert.equal(records.get('users/test-user').credits, 2);
  assert.equal(records.get(`immigrationPlans/test-user/items/${requestId}`).steps.length, 6);
  assert.equal((await post()).code, 200);
  assert.equal(records.get('users/test-user').credits, 2);
  assert.equal(records.size, 3);
});

test('falha antes do commit não cobra nem salva roteiro', async () => {
  const { records, post } = createHarness(5, true);
  const response = await post();
  assert.equal(response.code, 500);
  assert.equal(records.get('users/test-user').credits, 5);
  assert.equal(records.size, 1);
});
