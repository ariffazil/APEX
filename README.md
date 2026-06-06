<!-- SOT-MANIFEST
owner: Arif
last_verified: 2026-05-19
valid_from: 2026-05-19
valid_until: 2026-06-19
confidence: high
scope: /root/APEX
epistemic_status: CLAIM
-->

# APEX — Constitutional Verdict Engine

> **Formerly housed at `/root/HERMES`.** Rebranded and relocated to APEX to
> eliminate collision with the Hermes Agent runtime.
> Hermes agent data now belongs under `AAA`; `/root/HERMES` is a temporary
> compatibility path only.

> **Status:** OPERATIONAL | **Organ:** RELAY (Ψ) | **Authority:** arifOS
> **Domain:** Constitutional verdict service | **Remote:** None (local-only)

## 🏛️ What this repo is

The constitutional verdict engine within the arifOS federation. APEX is a
CommonJS Express application that evaluates candidate actions against F1-F13
constitutional floors and returns SEAL / HOLD_888 / VOID verdict envelopes. It
runs as a standalone service on port 3002.

**APEX owns the verdict service implementation. arifOS remains the canonical law
kernel and final constitutional authority.**

## 📦 Ownership

- **Owns**: A2A protocol relay, agent card endpoints, deterministic verdict service logic.
- **Does NOT own**: Agent identity/workspaces (AAA), constitutional law (arifOS), execution (A-FORGE).

## 🏗️ Current Structure

```
APEX/
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
- **Canonical source path:** `/root/APEX`
- **Hermes agent runtime path:** `/root/AAA/agents/hermes-asi/runtime`
- **Compatibility path:** `/root/HERMES` may remain until systemd and runtime
  references are fully retired
- **No linter or formatter** currently configured
- Deliberation logic is deterministic (CommonJS, no TypeScript)

## 🔗 Federation Loop

- [arifOS](https://github.com/ariffazil/arifOS) — Kernel (888 JUDGE, constitutional verdicts)
- [AAA](https://github.com/ariffazil/AAA) — Body (A2A gateway via port 3001)

---

*Last Verified: 2026.05.16 | 999 SEAL ALIVE*



> **Evidence Contract.** This organ emits the standard envelope (epistemic_tag, evidence_quality, source_attribution, uncertainty_band, delta_S) per [arifOS 000_CONSTITUTION.md](../../arifOS/static/arifos/theory/000/000_CONSTITUTION.md) Appendix B. arifOS reads the envelope and applies L01–L13. This organ does not self-judge.

