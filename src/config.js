/**
 * APEX Model Configuration — Cross-Agent Resilience Contract
 * APEX default  = OpenClaw fallback
 * APEX fallback = OpenClaw default
 */
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.APEX_CONFIG_PATH || path.join(__dirname, '..', 'config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Apex] Could not load config.json, using defaults:', e.message);
    return {
      model_contract: {
        apex: {
          default: process.env.APEX_DEFAULT_MODEL || 'minimax/MiniMax-M2.7',
          fallback: process.env.APEX_FALLBACK_MODEL || 'opencode/claude-opus-4-6'
        }
      }
    };
  }
}

module.exports = { loadConfig };
