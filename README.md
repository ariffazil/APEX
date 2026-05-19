<!-- SOT-MANIFEST
owner: Arif
last_verified: 2026-05-19
valid_from: 2026-05-19
valid_until: 2026-06-19
confidence: high
scope: /root/HERMES
epistemic_status: CLAIM
-->

# APEX — Constitutional Verdict Engine

> **Formerly HERMES.** Rebranded to APEX to eliminate collision with Nous Research Hermes Agent.
> The `/root/HERMES` directory is retained because it also stores Nous Research Hermes runtime data
> (sessions, skills, cron outputs). The arifOS federation node source lives in `src/` and `test/`.

> **Status:** OPERATIONAL | **Organ:** RELAY (Ψ) | **Authority:** arifOS
> **Domain:** Internal A2A agent | **Remote:** None (local-only)

## 🏛️ What this repo is

The constitutional verdict engine (888 JUDGE) within the arifOS federation. APEX is a CommonJS Express application that evaluates candidate actions against F1–F13 constitutional floors and returns binding SEAL / HOLD_888 / VOID verdicts. It runs as a standalone service on port 3002.

**APEX owns the JUDGMENT — the deterministic constitutional review that gates agent action across the federation mesh.**

## 📦 Ownership

- **Owns**: A2A protocol relay, agent card endpoints, deterministic deliberation logic.
- **Does NOT own**: Constitutional judgment (arifOS 888 JUDGE), execution (A-FORGE).

## 🏗️ Current Structure

```
HERMES/
├── src/
│   ├── server.js          # Express application (~414 lines), A2A endpoints, deliberation
│   └── config.js         # Config loader (reads config.json or env vars)
├── test/                 # Minimal node:test suite (config + constants only)
├── config.json          # Model contract and deliberation mode
└── package.json         # Node.js scripts
```

## 🚀 Verified Commands

```bash
# Install
npm install

# Start
npm start

# Dev (watch mode)
npm run dev

# Test (minimal — config + constants only)
npm test

# Health check
npm run health
```

## ⚠️ Important Notes

- **No git remote configured** — this repo is local-only
- **No linter or formatter** currently configured
- Deliberation logic is deterministic (CommonJS, no TypeScript)

## 🔗 Federation Loop

- [arifOS](https://github.com/ariffazil/arifOS) — Kernel (888 JUDGE, constitutional verdicts)
- [AAA](https://github.com/ariffazil/AAA) — Body (A2A gateway via port 3001)

---

*Last Verified: 2026.05.16 | 999 SEAL ALIVE*
