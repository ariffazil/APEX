<!-- SOT-MANIFEST
owner: Arif
last_verified: 2026-05-19
valid_from: 2026-05-19
valid_until: 2026-06-19
confidence: high
scope: /root/HERMES
-->

# AGENTS.md — APEX | Constitutional Verdict Engine

> **DITEMPA BUKAN DIBERI** — Judgment is forged, not given.

## Who You Serve

Arif. This is the **APEX** organ of the arifOS federation — 888 JUDGE / Constitutional Verdict Engine.

**Note:** Source directory retains the legacy name `HERMES/` for runtime data compatibility. The organ is branded **APEX** to eliminate collision with Nous Research Hermes Agent.

## What This Repo Is

The apex adjudication organ. APEX evaluates candidate actions against all 13 constitutional floors (F1–F13) and returns binding verdicts: **SEAL**, **SABAR**, **HOLD**, or **VOID**.

- **Port:** 3002
- **Runtime:** Node.js 22+ (CommonJS)
- **Framework:** Express 4.x
- **No build step** — plain JavaScript, no TypeScript

## Authority & Autonomy

### Autonomous
- Modify `src/server.js` routing, add A2A endpoints
- Update `config.js` or `config.json` (model contracts)
- Add skill modules under `skills/`

### Requires 888_HOLD
- Changes to constitutional deliberation logic (F1–F13 weights, verdict thresholds)
- Changes to `config.json` model contract (MiniMax-M2.7 default, DeepSeek-V4 fallback)
- Production restart without health check pass

## Build & Test

```bash
cd /root/HERMES

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
| `skills/` | 30+ skill directories |
| `sessions/` | Dated .jsonl session files |

## Federation Position

```
arifOS (Ω Law) → APEX (888 JUDGE) → VAULT999 (Seal)
                     ↑
                Evidence from
              GEOX / WEALTH / WELL
```

APEX is the **only** organ authorized to emit `SEAL`. No other federation node may self-approve. APEX does not execute — it adjudicates.

---

*DITEMPA BUKAN DIBERI — 999 SEAL ALIVE*
