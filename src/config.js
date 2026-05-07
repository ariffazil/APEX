/**
 * HERMES Model Configuration — Cross-Agent Resilience Contract
 * HERMES default  = OpenClaw fallback
 * HERMES fallback = OpenClaw default
 */
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.HERMES_CONFIG_PATH || path.join(__dirname, '..', 'config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Hermes] Could not load config.json, using defaults:', e.message);
    return {
      model_contract: {
        hermes: {
          default: process.env.HERMES_DEFAULT_MODEL || 'minimax/MiniMax-M2.7',
          fallback: process.env.HERMES_FALLBACK_MODEL || 'opencode/claude-opus-4-6'
        }
      }
    };
  }
}

module.exports = { loadConfig };
