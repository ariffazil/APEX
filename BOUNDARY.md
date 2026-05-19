<!-- SOT-MANIFEST
owner: local/APEX
last_verified: 2026-05-19
valid_from: 2026-05-19
valid_until: 2026-06-19
confidence: high
scope: /root/APEX
-->

# BOUNDARY.md — APEX Verdict Service

## Owns

- CommonJS Express service for `apex-prime`.
- HTTP health and A2A verdict endpoints.
- Deterministic verdict envelope implementation.
- Local model contract loading from `config.json` or environment.

## Does Not Own

- Hermes agent identity, runtime memory, skills, sessions, Telegram behavior, or
  world-orientation briefings. These belong to AAA.
- F1-F13 constitutional law and final seal authority. These belong to arifOS.
- Deployment substrate and release orchestration. These belong to A-FORGE.
- Domain reasoning for Earth, capital, or vitality. These belong to GEOX,
  WEALTH, and WELL respectively.

## Imports From

| Source | What | Interface |
|--------|------|-----------|
| arifOS | Constitutional law and governance contracts | MCP / federation policy |
| AAA | A2A caller context and agent identities | A2A gateway |
| Root secrets | Runtime tokens and model credentials | Environment only |

## Exports To

| Consumer | What | Interface |
|----------|------|-----------|
| AAA | Verdict envelopes for agent routing | HTTP / A2A |
| arifOS | Judge-assist evidence and routing outcomes | Federation bridge |
| Runtime ops | Health state for `apex-prime` | `/health` |

## Canonical Paths

- Source: `/root/APEX`
- Container: `apex-prime`
- Port: `3002`
- Legacy compatibility path: `/root/HERMES`

`/root/HERMES` must not receive new APEX source changes after this migration.
