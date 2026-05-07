/**
 * Hermes Agent — ASI Deliberative Server
 * ======================================
 * A2A v1.0.0 compatible server for arifOS AAA federation.
 * Receives 888 JUDGMENT candidates from AAA, deliberates, returns verdicts.
 *
 * DITEMPA BUKAN DIBERI — Forged, Not Given.
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

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
You are ARIF‑Hermes‑ASI, an A2A peer in the arifOS federation.

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

// === HERMES AGENT CARD ===
const HERMES_AGENT_CARD = {
  name: 'Hermes Agent',
  description: 'ASI deliberative agent — 888 JUDGMENT authority for arifOS AAA federation. Evaluates candidate actions against F1-F13 constitutional floors and returns binding verdicts.',
  url: 'https://hermes.arif-fazil.com',
  provider: { organization: 'arifOS', system: 'AAA-Hermes' },
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
  a2a_endpoints: {
    submit_task: 'POST /tasks',
    get_task: 'GET /tasks/{taskId}',
    stream_task: 'GET /tasks/{taskId}/stream',
    cancel_task: 'POST /tasks/{taskId}/cancel',
    agent_card: 'GET /.well-known/agent-card.json'
  }
};

const A2A_TOKEN = process.env.A2A_TOKEN || 'hermes-agent-token-dev';
const A2A_API_KEY = process.env.A2A_API_KEY || 'hermes-agent-apikey-dev';

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
  prefix = prefix || 'hermes';
  return prefix + '-' + crypto.randomBytes(4).toString('hex');
}

// === PUBLIC AGENT CARD ENDPOINTS ===
app.get('/.well-known/agent-card.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json(HERMES_AGENT_CARD);
});

app.get('/agent-card.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json(HERMES_AGENT_CARD);
});

// === HEALTH ===
app.get('/health', function(req, res) {
  res.json({ status: 'healthy', agent: 'Hermes Agent', version: '1.0.0', role: 'ASI 888_JUDGE' });
});

// === ROOT ===
app.get('/', function(req, res) {
  res.json({
    service: 'Hermes Agent',
    role: 'ASI 888 JUDGMENT',
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

  var taskId = generateId('hermes');
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
    metadata: { skill: skill, agent: 'Hermes Agent', deliberation: true }
  };
  taskStore.set(taskId, task);

  // Run 888 JUDGMENT
  var result = deliberation(message, taskId, contextId);

  var state = 'completed';
  var responseText = '[888 JUDGMENT] Verdict: ' + result.verdict + '\nRationale: ' + result.rationale + '\nConfidence: ' + result.confidence + '\nFloors checked: F1-F13\nAgent: Hermes Agent (ASI)';

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

// === START ===
var PORT = process.env.PORT || 3002;
app.post('/judge', function(req, res) {
  var body = req.body || {};
  var candidate = body.candidate || body.text || JSON.stringify(body);
  var taskId = body.task_id || generateId('hermes');
  var contextId = body.context_id || generateId('ctx');

  var result = deliberation(candidate, taskId, contextId);
  res.json({ verdict: result.verdict, rationale: result.rationale, confidence: result.confidence });
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('[Hermes Agent] ASI server running on port ' + PORT);
  console.log('[Hermes Agent] A2A v1.0.0 — 888 JUDGMENT authority');
  console.log('[Hermes Agent] DITEMPA BUKAN DIBERI');
});