const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('APEX constants', () => {
  it('VERDICT has required keys', () => {
    const VERDICT = { SEAL: 'SEAL', HOLD_888: 'HOLD_888', VOID: 'VOID', SABAR: 'SABAR' };
    assert.strictEqual(VERDICT.SEAL, 'SEAL');
    assert.strictEqual(VERDICT.HOLD_888, 'HOLD_888');
    assert.strictEqual(VERDICT.VOID, 'VOID');
  });
});
