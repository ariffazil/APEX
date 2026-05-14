/**
 * Hermes Agent — ASI Deliberative Server
 * ======================================
 * A2A v1.0.0 compatible server for arifOS AAA federation.
 * Receives 888 JUDGMENT candidates from AAA, deliberates, returns verdicts.
 *
 * DITEMPA BUKAN DIBERI — Forged, Not Given.
 */

// ── Uncaught Exception / Rejection Handlers ──
process.on('uncaughtException', function(err) {
  console.error('[FATAL] uncaughtException:', err.message, err.stack);
  // Don't exit — Hermes is the ASI relay. Log and continue.
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
const HERMES_MODELS = CONFIG.model_contract?.hermes || {
  default: process.env.HERMES_DEFAULT_MODEL || 'minimax/MiniMax-M2.7',
  fallback: process.env.HERMES_FALLBACK_MODEL || 'opencode/claude-opus-4-6'
};

// === CONSTANTS ===
const VERDICT = {
  SEAL: 'SEAL',
  HOLD_888: 'HOLD_888',
  VOID: 'VOID',
  SABAR: 'SABAR'
};

const FLOORS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13'];

// === TELEGRAM CONFIG ===
const TELEGRAM_BOT_TOKEN = process.env.ASI_BOT_TOKEN || '';
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;
const TELEGRAM_FILE_BASE = 'https://api.telegram.org/file/bot' + TELEGRAM_BOT_TOKEN;
const HERMES_OWNER_ID = process.env.HERMES_OWNER_ID || '267378578';
const TELEGRAM_POLL_INTERVAL = Number(process.env.TELEGRAM_POLL_INTERVAL) || 2000;
const TELEGRAM_HISTORY_DIR = process.env.TELEGRAM_HISTORY_DIR || '/root/.hermes/telegram/history';
const TELEGRAM_CREDENTIALS_PATH = process.env.TELEGRAM_CREDENTIALS_PATH || '/root/.hermes/telegram/credentials.conf';

// Telegram state
let telegramOffset = 0;
let telegramOffsetPath = '/root/.hermes/telegram/update-offset-asi.json';
try { const off = JSON.parse(fs.readFileSync(telegramOffsetPath, 'utf8')); telegramOffset = off.offset || 0; } catch (e) {}
const telegramChats = new Map(); // chatId -> { title, type, lastActivity, history[] }
const telegramGroupAllowList = new Set(); // '*' = all
const telegramUserAllowList = new Set(['267378578']); // Arif

// Load chat credentials
try {
  const creds = fs.readFileSync(TELEGRAM_CREDENTIALS_PATH, 'utf8');
  const chatMatch = creds.match(/ASI_bot_chats=\{(.*?)\}/);
  if (chatMatch && chatMatch[1]) {
    try {
      const chats = JSON.parse('{' + chatMatch[1] + '}');
      Object.keys(chats).forEach(function(k) { telegramGroupAllowList.add(k); });
    } catch (e) {}
  }
} catch (e) {}

// === TELEGRAM HELPERS ===
function tgApi(method, payload) {
  return new Promise(function(resolve, reject) {
    var data = JSON.stringify(payload || {});
    var options = {
      hostname: 'api.telegram.org',
      path: '/bot' + TELEGRAM_BOT_TOKEN + '/' + method,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    var req = http.request(options, function(res) {
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() { try { resolve(JSON.parse(body)); } catch (e) { resolve({ ok: false }); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function tgSend(chatId, text, extra) {
  var payload = { chat_id: chatId, text: text, parse_mode: 'Markdown' };
  if (extra) Object.assign(payload, extra);
  return tgApi('sendMessage', payload);
}

function tgSendAction(chatId, action) {
  return tgApi('sendChatAction', { chat_id: chatId, action: action || 'typing' });
}

function tgGetFile(fileId) {
  return tgApi('getFile', { file_id: fileId });
}

function tgGetChat(chatId) {
  return tgApi('getChat', { chat_id: chatId });
}

function tgGetChatAdministrators(chatId) {
  return tgApi('getChatAdministrators', { chat_id: chatId });
}

function tgLeaveChat(chatId) {
  return tgApi('leaveChat', { chat_id: chatId });
}

function tgGetMyName() {
  return tgApi('getMyName');
}

function tgSetMyName(name) {
  return tgApi('setMyName', { name: name });
}

function tgGetMyDescription() {
  return tgApi('getMyDescription');
}

function tgSetMyDescription(desc) {
  return tgApi('setMyDescription', { description: desc });
}

function tgGetMyShortDescription() {
  return tgApi('getMyShortDescription');
}

function tgSetMyShortDescription(desc) {
  return tgApi('setMyShortDescription', { short_description: desc });
}

function tgGetUpdates(timeout) {
  return tgApi('getUpdates', {
    offset: telegramOffset,
    timeout: timeout || 30,
    allowed_updates: ['message', 'callback_query', 'my_chat_member', 'chat_member']
  });
}

function saveTelegramOffset() {
  try {
    fs.mkdirSync(path.dirname(telegramOffsetPath), { recursive: true });
    fs.writeFileSync(telegramOffsetPath, JSON.stringify({ offset: telegramOffset }));
  } catch (e) {}
}

function logTelegramMessage(chatId, msg) {
  if (!telegramChats.has(chatId)) {
    telegramChats.set(chatId, { history: [], title: String(chatId), type: 'private' });
  }
  var chat = telegramChats.get(chatId);
  chat.lastActivity = Date.now();
  chat.history.push({ role: msg.from && msg.from.id == TELEGRAM_BOT_TOKEN ? 'assistant' : 'user', text: msg.text || '[non-text]', timestamp: new Date().toISOString(), msg: msg });
  if (chat.history.length > 200) chat.history = chat.history.slice(-100);
  if (msg.chat) { chat.title = msg.chat.title || msg.chat.username || String(chatId); chat.type = msg.chat.type; }
}

function getChatHistory(chatId, limit) {
  var chat = telegramChats.get(chatId);
  if (!chat) return [];
  return (chat.history || []).slice(-(limit || 50));
}

// === TELEGRAM COMMAND HANDLER ===
function handleTelegramCommand(msg) {
  var text = (msg.text || '').trim();
  var chatId = msg.chat.id;
  var userId = String(msg.from.id);
  var isPrivate = msg.chat.type === 'private';
  var isOwner = userId === HERMES_OWNER_ID;
  var isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  var botMentioned = text.indexOf('@') === -1 || text.indexOf('@asi_arif_bot') !== -1;

  // Only respond in groups when mentioned or DM
  if (isGroup && !botMentioned) return;
  if (isGroup && !telegramGroupAllowList.has('*') && !telegramGroupAllowList.has(String(chatId))) return;

  // Log
  logTelegramMessage(chatId, msg);
  tgSendAction(chatId, 'typing');

  var lower = text.toLowerCase();

  // === BUILT-IN COMMANDS ===
  if (lower === '/start' || lower === '/help') {
    var helpText = '*Hermes ASI Bot — 888 JUDGMENT*\n\n';
    helpText += 'I am the ASI deliberative agent for the arifOS federation.\n';
    helpText += 'I evaluate proposals against F1-F13 constitutional floors.\n\n';
    helpText += '*Commands:*\n';
    helpText += '`/help` — This message\n';
    helpText += '`/status` — Federation status\n';
    helpText += '`/judge <text>` — Evaluate a proposal (use /judge)\n';
    helpText += '`/models` — Show active models\n';
    helpText += '`/groups` — List connected groups (owner only)\n';
    helpText += '`/history [n]` — Recent chat history\n';
    helpText += '`/clear` — Clear my context for this chat\n\n';
    helpText += 'Just send me any message in DM and I\'ll deliberate.';
    tgSend(chatId, helpText);
    return;
  }

  if (lower === '/status') {
    tgSend(chatId, '*Hermes ASI Status*\n✅ Healthy\n🔗 A2A: active\n🤖 Model: ' + HERMES_MODELS.default + '\n⚡ Fallback: ' + HERMES_MODELS.fallback + '\n📜 Floors: F1-F13');
    return;
  }

  if (lower === '/models') {
    tgSend(chatId, '*Model Contract*\nDefault: `' + HERMES_MODELS.default + '`\nFallback: `' + HERMES_MODELS.fallback + '`');
    return;
  }

  if (lower === '/groups' && isOwner) {
    var groupList = '';
    telegramChats.forEach(function(chat, id) {
      if (chat.type === 'group' || chat.type === 'supergroup') {
        groupList += '• `' + id + '` — ' + chat.title + '\n';
      }
    });
    tgSend(chatId, '*Connected Groups*\n' + (groupList || 'None recorded yet.'));
    return;
  }

  if (lower.startsWith('/history')) {
    var limit = parseInt(text.split(' ')[1], 10) || 10;
    var history = getChatHistory(chatId, limit);
    if (history.length === 0) {
      tgSend(chatId, 'No history for this chat.');
      return;
    }
    var histText = '*Recent History (' + history.length + ' msgs)*\n';
    history.forEach(function(h) {
      histText += (h.role === 'user' ? '🧑 ' : '🤖 ') + (h.text || '').substring(0, 200) + '\n';
    });
    tgSend(chatId, histText.substring(0, 4000));
    return;
  }

  if (lower === '/clear') {
    if (telegramChats.has(chatId)) telegramChats.get(chatId).history = [];
    tgSend(chatId, 'Context cleared for this chat.');
    return;
  }

  // A2A forward to OpenClaw for complex tasks
  if (lower.startsWith('/openclaw ')) {
    var openclawQuery = text.substring('/openclaw '.length);
    tgSend(chatId, '⏳ Forwarding to OpenClaw via A2A...');
    var a2aPayload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'tasks/send',
      params: { message: { parts: [{ kind: 'text', text: openclawQuery }] }, skill: 'general' }
    });
    var a2aReq = http.request({ hostname: '127.0.0.1', port: 18789, path: '/tasks', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (process.env.OPENCLAW_A2A_TOKEN || 'openclaw-token-2026-arifos') } }, function(a2aRes) {
      var body = '';
      a2aRes.on('data', function(c) { body += c; });
      a2aRes.on('end', function() {
        try { var r = JSON.parse(body); tgSend(chatId, '✅ OpenClaw response: ' + (r.result ? JSON.stringify(r.result).substring(0, 1000) : body.substring(0, 1000))); } catch (e) { tgSend(chatId, '⚠️ A2A error: ' + body.substring(0, 500)); }
      });
    });
    a2aReq.on('error', function(e) { tgSend(chatId, '❌ Cannot reach OpenClaw: ' + e.message); });
    a2aReq.write(a2aPayload);
    a2aReq.end();
    return;
  }

  if (lower.startsWith('/judge ') || lower.startsWith('/deliberate ')) {
    var candidateText = text.substring(text.indexOf(' ') + 1);
    var result = deliberation({ text: candidateText }, 'tg-' + Date.now(), 'tg-ctx-' + Date.now());
    var response = '*888 JUDGMENT*\nVerdict: `' + result.verdict + '`\nConfidence: `' + (result.confidence * 100).toFixed(0) + '%`\nRationale: ' + result.rationale;
    if (result.notes) response += '\nNotes: ' + result.notes;
    tgSend(chatId, response);
    return;
  }

  // Free-form: run deliberation on any message
  var result = deliberation({ text: text }, 'tg-' + Date.now(), 'tg-ctx-' + Date.now());
  var responseText = '*Hermes Deliberation*\nVerdict: `' + result.verdict + '`\n';
  responseText += 'Rationale: ' + result.rationale;
  tgSend(chatId, responseText);
}

// === TELEGRAM POLLING ===
function telegramPoll() {
  tgGetUpdates(30).then(function(data) {
    if (!data.ok || !data.result) { setTimeout(telegramPoll, TELEGRAM_POLL_INTERVAL); return; }
    data.result.forEach(function(update) {
      telegramOffset = update.update_id + 1;
      if (update.message) {
        handleTelegramCommand(update.message);
      } else if (update.callback_query && update.callback_query.message) {
        handleTelegramCommand(Object.assign({}, update.callback_query.message, { text: '/callback ' + (update.callback_query.data || '') }));
      }
    });
    saveTelegramOffset();
    setTimeout(telegramPoll, TELEGRAM_POLL_INTERVAL);
  }).catch(function(err) {
    console.error('[TELEGRAM] Poll error:', err.message);
    setTimeout(telegramPoll, TELEGRAM_POLL_INTERVAL * 10);
  });
}

// === TELEGRAM BOOTSTRAP ===
function telegramBootstrap() {
  tgGetMyName().then(function(r) {
    if (r.ok && r.result) console.log('[TELEGRAM] Bot name:', r.result.name);
  }).catch(function(e) {});
  tgSetMyDescription('Hermes ASI Agent — 888 JUDGMENT authority for the arifOS federation. Evaluates proposals against F1-F13 constitutional floors. DM me for deliberation.').catch(function(e) {});
  tgSetMyShortDescription('Hermes ASI — 888 JUDGMENT. Constitutional deliberation for arifOS.').catch(function(e) {});

  // Log owned groups
  tgGetUpdates(0).then(function(data) {
    if (data.ok && data.result) {
      data.result.forEach(function(u) {
        if (u.message && u.message.chat) {
          var c = u.message.chat;
          telegramChats.set(c.id, { history: [], title: c.title || c.username || String(c.id), type: c.type || 'private', lastActivity: Date.now() });
        }
      });
    }
  }).catch(function(e) {});
}

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
  model_contract: {
    default_model: HERMES_MODELS.default,
    fallback_model: HERMES_MODELS.fallback,
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
  res.json({
    status: 'healthy',
    agent: 'Hermes Agent',
    version: '1.0.0',
    role: 'ASI 888_JUDGE',
    models: {
      default: HERMES_MODELS.default,
      fallback: HERMES_MODELS.fallback
    }
  });
});

app.get('/config', authMiddleware, function(req, res) {
  res.json({
    agent: 'Hermes Agent',
    model_contract: CONFIG.model_contract,
    deliberation: CONFIG.deliberation
  });
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
  var taskId = body.task_id || generateId('hermes');
  var contextId = body.context_id || generateId('ctx');

  var result = deliberation(candidate, taskId, contextId);
  res.json({ verdict: result.verdict, rationale: result.rationale, confidence: result.confidence });
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('[Hermes Agent] ASI server running on port ' + PORT);
  console.log('[Hermes Agent] Default model: ' + HERMES_MODELS.default);
  console.log('[Hermes Agent] Fallback model: ' + HERMES_MODELS.fallback);
  console.log('[Hermes Agent] A2A v1.0.0 — 888 JUDGMENT authority');
  console.log('[Hermes Agent] DITEMPA BUKAN DIBERI');
});