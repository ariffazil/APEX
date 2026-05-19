<!-- SOT-MANIFEST
owner: Arif
last_verified: 2026-05-19
valid_from: 2026-05-19
valid_until: 2026-06-19
confidence: high
scope: /root/APEX
-->

# AGENTS.md — APEX | Constitutional Verdict Engine

> **DITEMPA BUKAN DIBERI** — Judgment is forged, not given.

## Who You Serve

Arif. This is the **APEX** verdict service of the arifOS federation.

**Note:** Source now lives at `/root/APEX`. Hermes is an AAA-owned agent/runtime
identity. `/root/HERMES` is a temporary compatibility path only.

## What This Repo Is

The APEX verdict service evaluates candidate actions against constitutional
floor inputs and returns verdict envelopes: **SEAL**, **SABAR**, **HOLD**, or
**VOID**. arifOS remains the canonical law kernel and final constitutional
authority.

- **Port:** 3002
- **Runtime:** Node.js 22+ (CommonJS)
- **Framework:** Express 4.x
- **No build step** — plain JavaScript, no TypeScript

## Authority & Autonomy

### Autonomous
- Modify `src/server.js` routing, add A2A endpoints
- Update `config.js` or `config.json` (model contracts)
- Add service tests under `test/`

### Requires 888_HOLD
- Changes to constitutional deliberation logic (F1–F13 weights, verdict thresholds)
- Changes to `config.json` model contract (MiniMax-M2.7 default, DeepSeek-V4 fallback)
- Production restart without health check pass

## Build & Test

```bash
cd /root/APEX

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

## Key Files

| File | Purpose |
|------|---------|
| `src/server.js` | Entire Express application (~537 lines), A2A endpoints, deterministic F1-F13 deliberation |
| `src/config.js` | Config loader (reads `config.json` or env vars) |
| `config.json` | Model contract — MiniMax-M2.7 default, DeepSeek-V4 fallback, Kimi-K2.6 emergency |
| `BOUNDARY.md` | Ownership split between APEX, Hermes, AAA, and arifOS |

## Federation Position

```
arifOS (Law Kernel) → APEX (Verdict Service) → AAA/A2A routing
                     ↑
                Evidence from
              GEOX / WEALTH / WELL
```

APEX may emit verdict envelopes, but it does not own constitutional law,
Hermes identity, runtime memory, or execution. No federation node may
self-approve irreversible actions; Arif and arifOS remain the final authority.

---

*DITEMPA BUKAN DIBERI — 999 SEAL ALIVE*
