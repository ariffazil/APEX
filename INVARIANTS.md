<!-- SOT-MANIFEST
owner: Arif
last_verified: 2026-05-25
valid_from: 2026-05-25
valid_until: 2026-06-25
confidence: high
scope: /root/APEX
-->

# INVARIANTS.md — APEX

> Constitutional Verdict Engine

## Canonical Branch

`apex`

## Live Endpoints

| Endpoint | Port | Status |
|----------|------|--------|
| Express A2A relay | `127.0.0.1:3002` | **NO SYSTEMD SERVICE** — not running persistently |
| Static site | `https://apex.arif-fazil.com` | Served by Caddy from `/var/www/html/apex` |

## Required Health Checks

- No automated health check configured for the Express service
- Manual check: `npm start` then `curl http://localhost:3002/health`

## Change Coupling

These files must change together:

- `src/server.js` — Express application (~583 lines)
- `src/config.js` — config loader
- `config.json` — model contract (MiniMax-M2.7 default, DeepSeek-V4 fallback)

## Forbidden Stale Assumptions

- ❌ No git remote configured
- ❌ No systemd service configured (`apex.service` does not exist)
- ❌ `apex.arif-fazil.com` serves static files, NOT the Express app
- ❌ Formerly housed at `/root/HERMES`; `/root/HERMES` is deprecated
- ❌ Hermes agent data belongs under `/root/AAA/agents/hermes-asi/runtime/`

## Verification

```bash
npm install
npm test
npm run health
```
