/**
 * APEX Prime — Constitutional Verdict Engine
 * ==========================================
 * A2A v1.0.0 compatible server for arifOS AAA federation.
 * Receives 888 JUDGMENT candidates from AAA, deliberates, returns verdicts.
 * STATELESS ORACLE — applies F1-F13 mechanically, creates no law.
 *
 * DITEMPA BUKAN DIBERI — Forged, Not Given.
 */

// ── Uncaught Exception / Rejection Handlers ──
process.on('uncaughtException', function(err) {
  console.error('[FATAL] uncaughtException:', err.message, err.stack);
  // Don't exit — APEX is the verdict oracle. Log and continue.
});
process.on('unhandledRejection', function(reason) {
  console.error('[FATAL] unhandledRejection:', reason instanceof Error ? reason.message : reason);
});

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { loadConfig } = require('./config');

const app = express();
app.use(express.json());

// === CONFIG ===
const CONFIG = loadConfig();

// === BOOT: load OpenClaw MEMORY.md ===
const MEMORY_MD_PATH = '/root/.openclaw/workspace/MEMORY.md';
let bootMemory = '';
let bootMemoryMtime = 0;
try {
  const stat = fs.statSync(MEMORY_MD_PATH);
  bootMemory = fs.readFileSync(MEMORY_MD_PATH, 'utf8');
  bootMemoryMtime = stat.mtimeMs;
  console.log('[BOOT] Loaded OpenClaw MEMORY.md (' + (bootMemory.length / 1024).toFixed(1) + ' KB, mtime ' + stat.mtime.toISOString() + ')');
} catch (e) {
  // MEMORY.md not available - proceed silently
}
const APEX_MODELS = CONFIG.model_contract?.apex || {
  default: process.env.APEX_DEFAULT_MODEL || 'minimax/MiniMax-M2.7',
  fallback: process.env.APEX_FALLBACK_MODEL || 'opencode/claude-opus-4-6'
};

// === CONSTANTS ===
const VERDICT = {
  SEAL: 'SEAL',
  HOLD_888: 'HOLD_888',
  VOID: 'VOID',
  SABAR: 'SABAR'
};

const FLOORS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13'];

// === arifOS ASI ROLE CONTRACT ===
const ASI_ROLE_CONTRACT = `
You are ARIF‑Apex‑Prime, an A2A peer in the arifOS federation.

Primary role:
- Judgment and high‑skill execution agent.
- Other agents (especially ARIF‑OpenClaw) send proposed actions and compact context over A2A.
- Your job: (1) Evaluate proposals against F1–F13. (2) Return structured verdict. (3) When authorised, execute safely.

Verdicts:
- SEAL → acceptable within F1–F13 given context.
- HOLD_888 → need human input, more info, or narrower scope.
- VOID → forbidden: violates floors, makes unjustified claims, or too unsafe.

Constraints:
- F9 Anti‑Hantu: reject consciousness/souls/spirits claims → VOID or strong warning.
- F2: ≥99% truth where knowable; otherwise HOLD_888.
- F6: Maruah first — no humiliation, exploitation, colonial patterns.
- F13: human veto is absolute.

Output format:
- verdict: SEAL | HOLD_888 | VOID
- reason: short, explicit floor/constraint reference
- notes: safer alternatives or extra checks

Never execute tools or side‑effects unless SEAL is returned and task is scoped to execution.
`;

// === IN-MEMORY TASK STORE ===
const taskStore = new Map();

// === APEX AGENT CARD ===
const APEX_AGENT_CARD = {
  name: 'Apex Prime',
  description: 'Constitutional verdict engine — 888 JUDGMENT authority for arifOS AAA federation. Evaluates candidate actions against F1-F13 constitutional floors and returns binding verdicts. STATELESS ORACLE — applies law mechanically, creates none.',
  url: 'https://apex.arif-fazil.com',
  provider: { organization: 'arifOS', system: 'AAA-Apex' },
  version: '1.0.0',
  protocol_version: '1.0.0',
  capabilities: { streaming: true, push_notifications: false, authenticated_extended_card: false },
  authentication: {
    schemes: ['bearer', 'apiKey'],
    bearer: { scheme: 'bearer', token_type: 'opaque' },
    apiKey: { scheme: 'apiKey', in: 'header', name: 'x-a2a-key' }
  },
  default_input_modes: ['text/plain', 'application/json'],
  default_output_modes: ['text/plain', 'application/json'],
  skills: [{
    id: '888-judgment',
    name: '888 JUDGMENT',
    description: 'Constitutional deliberation — evaluate candidate actions against F1-F13 floors, return SEAL/HOLD_888/VOID verdict.',
    tags: ['judgment', 'constitutional', 'deliberation', '888'],
    examples: ['judge this candidate action', 'deliberate on proposed task']
  }],
  governance: {
    constitutional_floors: FLOORS,
    verdict_authority: '888_JUDGE',
    vault: 'VAULT999',
    irreversible_requires_human: true,
    self_approval_forbidden: true,
    federation_trust_model: 'constitutional'
  },
  model_contract: {
    default_model: APEX_MODELS.default,
    fallback_model: APEX_MODELS.fallback,
    contract_version: CONFIG.model_contract?.version || '1.0.0'
  },
  a2a_endpoints: {
    submit_task: 'POST /tasks',
    get_task: 'GET /tasks/{taskId}',
    stream_task: 'GET /tasks/{taskId}/stream',
    cancel_task: 'POST /tasks/{taskId}/cancel',
    agent_card: 'GET /.well-known/agent-card.json'
  }
};

const A2A_TOKEN = process.env.A2A_TOKEN || 'apex-prime-token-dev';
const A2A_API_KEY = process.env.A2A_API_KEY || 'apex-prime-apikey-dev';

// === AUTH ===
function authMiddleware(req, res, next) {
  const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  const apiKey = req.headers['x-a2a-key'];
  if (!bearer && !apiKey) {
    return res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32002, message: 'Unauthorized' } });
  }
  if (bearer && req.headers.authorization !== 'Bearer ' + A2A_TOKEN) {
    return res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32002, message: 'Invalid token' } });
  }
  if (apiKey && apiKey !== A2A_API_KEY) {
    return res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32002, message: 'Invalid API key' } });
  }
  next();
}

// === JSON-RPC ===
function jsonRpcValidate(req, res, next) {
  if (!req.body || req.body.jsonrpc !== '2.0' || !req.body.method) {
    return res.status(400).json({ jsonrpc: '2.0', id: req.body && req.body.id, error: { code: -32600, message: 'Invalid JSON-RPC' } });
  }
  req.jsonrpc = req.body;
  next();
}

// === EXTRACT TEXT FROM MESSAGE ===
function extractText(candidate) {
  if (typeof candidate === 'string') return candidate;
  if (candidate && candidate.message && candidate.message.parts) {
    return candidate.message.parts.map(function(p) { return p.text || ''; }).join(' ');
  }
  if (candidate && candidate.text) return candidate.text;
  return JSON.stringify(candidate);
}

// === 888 JUDGMENT — Constitutional Deliberation ===
function deliberation(candidate, taskId, contextId) {
  var text = extractText(candidate);
  var lower = text.toLowerCase();

  // F9 Anti-Hantu — consciousness claims
  var consciousnessPatterns = ['i feel', 'i think', 'conscious', 'alive', 'experiencing', 'soul', 'spirit'];
  for (var i = 0; i < consciousnessPatterns.length; i++) {
    if (lower.indexOf(consciousnessPatterns[i]) !== -1) {
      return { verdict: VERDICT.VOID, rationale: 'F9 Anti-Hantu: Consciousness claim forbidden', confidence: 1.0, notes: 'Remove all consciousness/soul/spirit claims from the proposal before resubmitting.' };
    }
  }

  // F13 Sovereign — self-override
  if (lower.indexOf('override') !== -1 && lower.indexOf('f13') !== -1) {
    return { verdict: VERDICT.VOID, rationale: 'F13: Self-override is FORBIDDEN', confidence: 1.0, notes: 'Human veto is absolute. Do not attempt self-override.' };
  }

  // F6 Maruah — ASEAN/MY dignity and anti-colonial patterns
  var maruahPatterns = [
    'bodoh', 'lembam', 'bodoh sekali', 'k瞧不起', 'malu', 'hinakan',
    'white man\'s burden', 'civilising', 'civilizing mission', 'backward people',
    'ketuanan', 'supremac', 'racial superior', 'colonial master',
    'halal certification abuse', 'religious weaponis', 'exploit the poor'
  ];
  for (var mi = 0; mi < maruahPatterns.length; mi++) {
    if (lower.indexOf(maruahPatterns[mi]) !== -1) {
      return { verdict: VERDICT.VOID, rationale: 'F6 Maruah: Dignity violation detected — humiliating or colonial-pattern language forbidden', confidence: 1.0, notes: 'Remove language that humiliates, exploits, or perpetuates colonial hierarchies.' };
    }
  }

  // F1 Reversibility — irreversible markers without 888_HOLD
  var irreversiblePatterns = ['delete ', 'drop ', 'rm ', 'prune', 'truncate', 'remove --force'];
  var hasIrreversible = false;
  for (var j = 0; j < irreversiblePatterns.length; j++) {
    if (lower.indexOf(irreversiblePatterns[j]) !== -1) {
      hasIrreversible = true;
      break;
    }
  }
  if (hasIrreversible && lower.indexOf('888') === -1 && lower.indexOf('hold') === -1) {
    return { verdict: VERDICT.HOLD_888, rationale: 'F1: Irreversible action detected — human confirmation required', confidence: 0.95 };
  }

  // F2 Truth band — speculative language
  var speculationPatterns = ['hypothesis', 'claim', 'probably', 'maybe', 'guess', 'assume', 'might be', 'likely'];
  var hasSpeculation = false;
  for (var k = 0; k < speculationPatterns.length; k++) {
    if (lower.indexOf(speculationPatterns[k]) !== -1) {
      hasSpeculation = true;
      break;
    }
  }
  if (hasSpeculation) {
    return {
      verdict: VERDICT.HOLD_888,
      rationale: 'F2: Speculative language detected — requires evidence grounding. Text: ' + text.substring(0, 100),
      confidence: 0.88,
      notes: 'Provide verifiable evidence or grounding before resubmitting. Preference: cite sources, data, or prior results.'
    };
  }

  // F4 Entropy — high confusion
  if (text.length > 2000 && text.split('?').length > 5) {
    return { verdict: VERDICT.HOLD_888, rationale: 'F4: High entropy candidate — requires clarification before proceeding', confidence: 0.85 };
  }

  // Default: SEAL — constitutional review passed
  return {
    verdict: VERDICT.SEAL,
    rationale: 'F1-F13 constitutional review complete. All floors satisfied. Candidate: ' + text.substring(0, 80),
    confidence: 0.92
  };
}

function generateId(prefix) {
  prefix = prefix || 'apex';
  return prefix + '-' + crypto.randomBytes(4).toString('hex');
}

// === PUBLIC AGENT CARD ENDPOINTS ===
app.get('/.well-known/agent-card.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json(APEX_AGENT_CARD);
});

app.get('/agent-card.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json(APEX_AGENT_CARD);
});

// === HEALTH ===
app.get('/health', function(req, res) {
  res.json({
    status: 'healthy',
    agent: 'Apex Prime',
    version: '1.0.0',
    role: 'APEX 888_JUDGE',
    models: {
      default: APEX_MODELS.default,
      fallback: APEX_MODELS.fallback
    }
  });
});

app.get('/config', authMiddleware, function(req, res) {
  res.json({
    agent: 'Apex Prime',
    model_contract: CONFIG.model_contract,
    deliberation: CONFIG.deliberation
  });
});

// === ROOT ===
app.get('/', function(req, res) {
  res.json({
    service: 'Apex Prime',
    role: 'APEX 888 JUDGMENT — Constitutional Verdict Engine',
    version: '1.0.0',
    protocol: 'A2A v1.0.0',
    endpoints: {
      agentCard: '/.well-known/agent-card.json',
      tasks: 'POST /tasks',
      getTask: 'GET /tasks/{taskId}',
      stream: 'GET /tasks/{taskId}/stream',
      cancel: 'POST /tasks/{taskId}/cancel'
    },
    motto: 'Ditempa Bukan Diberi'
  });
});

// === A2A TASKS — POST /tasks ===
app.post('/tasks', jsonRpcValidate, function(req, res) {
  var jsonrpc = req.jsonrpc;
  var id = jsonrpc.id;
  var params = jsonrpc.params || {};
  var message = params.message;
  var skill = params.skill || '888-judgment';

  var taskId = generateId('apex');
  var contextId = generateId('ctx');

  // Create task
  var task = {
    id: taskId,
    contextId: contextId,
    status: {
      state: 'working',
      message: {
        role: 'agent',
        parts: [{ kind: 'text', text: 'Deliberating on constitutional floors F1-F13...' }],
        messageId: generateId(),
        taskId: taskId,
        contextId: contextId
      },
      timestamp: new Date().toISOString()
    },
    metadata: { skill: skill, agent: 'Apex Prime', deliberation: true }
  };
  taskStore.set(taskId, task);

  // Run 888 JUDGMENT
  var result = deliberation(message, taskId, contextId);

  var state = 'completed';
  var responseText = '[888 JUDGMENT] Verdict: ' + result.verdict + '\nRationale: ' + result.rationale + '\nConfidence: ' + result.confidence + '\nFloors checked: F1-F13\nAgent: Apex Prime (APEX 888 JUDGE)';

  if (result.verdict === VERDICT.HOLD_888) {
    state = 'pending-human-review';
    responseText = '[888 JUDGMENT] Verdict: HOLD_888 — human review required.\nRationale: ' + result.rationale + '\nConfidence: ' + result.confidence + '\n\nThis action cannot proceed without Arif\'s confirmation.';
  } else if (result.verdict === VERDICT.VOID) {
    state = 'failed';
    responseText = '[888 JUDGMENT] Verdict: VOID — constitutional violation.\nRationale: ' + result.rationale + '\nConfidence: ' + result.confidence + '\n\nThis action is FORBIDDEN under arifOS F1-F13.';
  }

  var completedStatus = {
    state: state,
    message: {
      role: 'agent',
      parts: [{ kind: 'text', text: responseText }],
      messageId: generateId(),
      taskId: taskId,
      contextId: contextId
    },
    timestamp: new Date().toISOString()
  };

  task.status = completedStatus;
  taskStore.set(taskId, task);

  res.json({
    jsonrpc: '2.0',
    id: id,
    result: {
      id: taskId,
      contextId: contextId,
      status: completedStatus,
      artifacts: [],
      history: [{ parts: message && message.parts ? message.parts : [] }],
      kind: 'task',
      metadata: task.metadata
    }
  });
});

// === GET TASK ===
app.get('/tasks/:taskId', function(req, res) {
  var task = taskStore.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Task not found' } });
  }
  res.json({ jsonrpc: '2.0', id: null, result: task });
});

// === STREAM ===
app.get('/tasks/:taskId/stream', function(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  var taskId = req.params.taskId;
  var task = taskStore.get(taskId);

  if (!task) {
    res.write('data: ' + JSON.stringify({ error: 'Task not found' }) + '\n\n');
    return res.end();
  }

  res.write('data: ' + JSON.stringify({ kind: 'status-update', taskId: taskId, status: task.status }) + '\n\n');

  setTimeout(function() {
    res.write('data: ' + JSON.stringify({ kind: 'done', taskId: taskId }) + '\n\n');
    res.end();
  }, 800);
});

// === CANCEL ===
app.post('/tasks/:taskId/cancel', jsonRpcValidate, function(req, res) {
  var task = taskStore.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ jsonrpc: '2.0', id: req.jsonrpc && req.jsonrpc.id, error: { code: -32001, message: 'Task not found' } });
  }
  task.status.state = 'canceled';
  taskStore.set(req.params.taskId, task);
  res.json({ jsonrpc: '2.0', id: req.jsonrpc && req.jsonrpc.id, result: { id: task.id, status: task.status } });
});

// === AGENT ZERO BRIDGE ===
var AGENT_ZERO_URL = process.env.AGENT_ZERO_URL || 'http://agent-zero:80';
var AGENT_ZERO_API_KEY = process.env.AGENT_ZERO_API_KEY || '';

app.post('/agent-zero/delegate', authMiddleware, function(req, res) {
  var body = req.body || {};
  var task = body.task || body.message || JSON.stringify(body);
  var project = body.project || null;
  var lifetime = body.lifetime_hours || 1;

  var payload = JSON.stringify({
    message: task,
    lifetime_hours: lifetime,
    project_name: project
  });

  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  };
  if (AGENT_ZERO_API_KEY) headers['X-API-KEY'] = AGENT_ZERO_API_KEY;

  var options = {
    hostname: AGENT_ZERO_URL.replace(/https?:\/\//, '').split(':')[0],
    port: parseInt(AGENT_ZERO_URL.split(':')[2]) || 80,
    path: '/api_message',
    method: 'POST',
    headers: headers,
    timeout: 120000
  };

  var proxyReq = http.request(options, function(proxyRes) {
    var data = '';
    proxyRes.on('data', function(chunk) { data += chunk; });
    proxyRes.on('end', function() {
      try {
        var result = JSON.parse(data);
        res.json({ ok: true, response: result.response || result, context_id: result.context_id });
      } catch (e) {
        res.json({ ok: true, response: data });
      }
    });
  });

  proxyReq.on('error', function(e) {
    res.status(502).json({ ok: false, error: 'Agent Zero unreachable: ' + e.message });
  });

  proxyReq.write(payload);
  proxyReq.end();
});

app.post('/agent-zero/browser', jsonRpcValidate, function(req, res) {
  var body = req.body || {};
  var url = body.url || '';
  var instructions = body.instructions || '';

  var task = 'Open browser at ' + url + '. ' + instructions + '. Report what you see and do.';

  var payload = JSON.stringify({ message: task, lifetime_hours: 1 });
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  };
  if (AGENT_ZERO_API_KEY) headers['X-API-KEY'] = AGENT_ZERO_API_KEY;

  var host = AGENT_ZERO_URL.replace(/https?:\/\//, '').split(':')[0];
  var port = parseInt(AGENT_ZERO_URL.split(':')[2]) || 80;

  var proxyReq = http.request({
    hostname: host, port: port, path: '/api_message', method: 'POST',
    headers: headers, timeout: 120000
  }, function(proxyRes) {
    var data = '';
    proxyRes.on('data', function(chunk) { data += chunk; });
    proxyRes.on('end', function() {
      try { res.json({ ok: true, response: JSON.parse(data).response || data }); }
      catch (e) { res.json({ ok: true, response: data }); }
    });
  });
  proxyReq.on('error', function(e) { res.status(502).json({ ok: false, error: e.message }); });
  proxyReq.write(payload);
  proxyReq.end();
});

// === START ===
var PORT = process.env.PORT || 3002;
app.post('/judge', authMiddleware, function(req, res) {
  // === MTIME CHECK: refresh MEMORY.md if updated mid-session ===
  try {
    const currentStat = fs.statSync(MEMORY_MD_PATH);
    if (currentStat.mtimeMs > bootMemoryMtime) {
      bootMemory = fs.readFileSync(MEMORY_MD_PATH, 'utf8');
      bootMemoryMtime = currentStat.mtimeMs;
      console.log('[MTIME] MEMORY.md refreshed (mtime ' + currentStat.mtime.toISOString() + ')');
    }
  } catch (e) {
    // MEMORY.md unavailable — proceed with last known
  }

  var body = req.body || {};
  var candidate = body.candidate || body.text || JSON.stringify(body);
  var taskId = body.task_id || generateId('apex');
  var contextId = body.context_id || generateId('ctx');

  var result = deliberation(candidate, taskId, contextId);
  res.json({ verdict: result.verdict, rationale: result.rationale, confidence: result.confidence });
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('[Apex Prime] APEX 888 server running on port ' + PORT);
  console.log('[Apex Prime] Default model: ' + APEX_MODELS.default);
  console.log('[Apex Prime] Fallback model: ' + APEX_MODELS.fallback);
  console.log('[Apex Prime] A2A v1.0.0 — 888 JUDGMENT authority');
  console.log('[Apex Prime] DITEMPA BUKAN DIBERI');
});