const { describe, it } = require('node:test');
const assert = require('node:assert');
const { loadConfig } = require('../src/config');

describe('HERMES config', () => {
  it('loads cross-agent model contract', () => {
    const cfg = loadConfig();
    assert.ok(cfg.model_contract, 'model_contract exists');
    assert.strictEqual(cfg.model_contract.hermes.default, 'minimax/MiniMax-M2.7');
    assert.strictEqual(cfg.model_contract.hermes.fallback, 'opencode/claude-opus-4-6');
    assert.strictEqual(cfg.model_contract.openclaw.default, 'opencode/claude-opus-4-6');
    assert.strictEqual(cfg.model_contract.openclaw.fallback, 'minimax/MiniMax-M2.7');
  });
});
