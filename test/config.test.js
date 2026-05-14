const { describe, it } = require('node:test');
const assert = require('node:assert');
const { loadConfig } = require('../src/config');

describe('HERMES config', () => {
  it('loads cross-agent model contract', () => {
    const cfg = loadConfig();
    assert.ok(cfg.model_contract, 'model_contract exists');
    assert.strictEqual(cfg.model_contract.hermes.default, 'minimax/MiniMax-M2.7');
    assert.strictEqual(cfg.model_contract.hermes.fallback, 'deepseek/deepseek-v4-pro');
    assert.strictEqual(cfg.model_contract.openclaw.default, 'minimax/MiniMax-M2.7');
    assert.strictEqual(cfg.model_contract.openclaw.fallback, 'deepseek/deepseek-v4-pro');
  });
});
