# HERMES — ASI Deliberative Relay

> **Status:** OPERATIONAL | **Organ:** RELAY (Ψ) | **Authority:** arifOS
> **Domain:** Internal A2A agent | **Remote:** None (local-only)

## 🏛️ What this repo is

The ASI deliberative relay within the arifOS federation. HERMES is a CommonJS Express application that acts as an A2A (Agent-to-Agent) bridge, enabling cross-model deliberation and resilience contracts between constitutional agents. It runs as a standalone service on port 3002.

**HERMES owns the RELAY — the deterministic deliberation channel that connects agents across the federation mesh.**

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
