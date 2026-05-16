# ARIF.md | METABOLIC KERNEL v1.0

> SYSTEM TYPE: LORE INTERFACE
> GOVERNANCE: arifOS AAA
> VETO: 888 JUDGE
>
> INVARIANT: Descriptive memory of repo state.
> This file NEVER modifies Law. It only reports and compresses observed reality.
> Law lives in: arifOS `000/000_CONSTITUTION.md`. Template: https://gist.github.com/ariffazil/81314f6cda1ea898f9feb88ce8f8959b


## 0. IDENTITY & MOUNT POINT

- REPO_NAME: APEX
- CONTAINER_ID: 2026-05-16
- DOMAIN_ROLE: ASI Deliberative Relay — cross-model deliberation, bridge, resilience contract. Internal-only A2A service on port 3002.
- PUBLIC_SURFACE: NONE. apex.arif-fazil.com redirects to aaa.arif-fazil.com (temporary compat layer).
- STABILITY_CLASS: MAINTENANCE
- VERSION: v1.0.5
- NOTE: Local-only repo. No upstream remote. Sovereign decision: stays in AAA repo for config/secrets.


## 1. CURRENT FOCUS (INSTRUCTION POINTER)

- Branch: `apex` (no remote). Renamed from `master`.
- Container: `apex-prime:v1.0.5` running healthy (internal-only, no public ingress).
- Public endpoint: `apex.arif-fazil.com` → 308 redirect to `aaa.arif-fazil.com` (temporary compat layer).
- Model: MiniMax-M2.7 (primary) / DeepSeek V4 Pro (fallback) / OpenRouter (tertiary).
- Telegram subsystem: Dead code removed (~290 lines). Canonical interface via OpenClaw ACPX bridge.
- ACPX bridge: APEX spawns as child agent via stdio JSON-RPC (`apex-acp-sops`).
- SOPS env: `.env` encrypted. Wrapper decrypts in-memory only. Auto-cleanup on exit.
- Config: `config.json` — model contract v1.1.0, deliberation mode, 9-slot architecture.
- Tests: Minimal — only `config.js` loading and constants tested. Core server + deliberation logic untested.


## 2. OPERATIONAL MANDATE

- APEX is the ASI Deliberative Relay — bridges multiple AI models for constitutional deliberation.
- A2A protocol: Agent-to-Agent mesh on port 3002.
- Telegram: Canonical operator interface. Routes to arifOS via AAA-A2A.
- Deliberation: Multi-model cross-checking. Constitutional verdict spectrum.
- Upstream: arifOS (constitutional kernel), AAA-A2A (agent mesh).
- Downstream: Arif (via Telegram), OpenClaw ACPX (parent bridge).
- Known gap: APEX→GEOX/WEALTH use mismatched auth (ED25519 vs JWT). Transport matrix needed.


## 3. THE 999 SEAL (SESSION LOG)

- 2026-05-16 | Omega | HERMES renamed to APEX across all docs, config, and source.
- 2026-05-15 | Omega | ARIF.md created. SOT baseline established. APEX previously had zero SOT documentation.
- 2026-05-14 | Omega | Dead Telegram subsystem removed (~290 lines). ACPX bridge validated (APEX + Kimi Code as child agents).
- 2026-05-13 | OpenCode | Model architecture updated: 9-slot config. MiniMax primary, Kimi/OpenRouter fallbacks. DeepSeek key rotated.
- 2026-05-11 | Kimi Code | Sovereign: HERMES stays in AAA repo. No separate remote.


## 4. ACTIVE TOPOLOGY (MEMORY MAP)

- CRITICAL_FILES:
  - `src/server.js` → Express application (~414 lines). A2A endpoints, deliberation engine.
  - `src/config.js` → Config loader (config.json or env vars).
  - `config.json` → Model contract v1.1.0 + deliberation mode.
  - `test/` → Minimal tests (config only).

- ENTRYPOINTS:
  - `npm start` → Start APEX gateway (internal only)
  - `apex-acp-sops --accept-hooks` → ACPX child agent via SOPS

- DATA_FLOWS:
  - Telegram → HERMES → AAA-A2A → arifOS JUDGE → verdict
  - OpenClaw ACPX → hermes-acp-sops → stdio JSON-RPC → deliberation


## 5. INTERRUPTS & FAULTS (BLOCKERS)

- HARD_BLOCK: None. Container healthy. No public surface.
- SOFT_FRICTION: No upstream remote — all commits are local. Backup strategy: Hermes backups cron + AAA repo.
- SOFT_FRICTION: Minimal test coverage — only config.js tested. Core server + deliberation logic untested.
- KNOWN_GAP: HERMES→GEOX protocol gap (ED25519 vs JWT auth mismatch). Transport matrix not documented.


## 6. RECENT SCARS (W_scar)

- [2026-05-14] → [Dead Telegram subsystem] → [Removed ~290 lines. Canonical interface via OpenClaw ACPX.]
- [2026-05-13] → [Telegram bridge built then removed] → [Redundant — Hermes already handles Telegram.]


## 7. EXECUTION BUFFER (COMMANDS)

| Command | Status | Context |
|---------|--------|---------|
| `npm start` | ✅ | APEX gateway on 3002 |
| `npm test` | ⚠️ | Minimal — config only |
| `npm run health` | ✅ | Health check |


## 8. PRIVILEGE ESCALATION (888 HOLD)

- [Q]: Add upstream remote for APEX?
- [CONTEXT]: Sovereign decided APEX stays in AAA repo. No separate remote needed. Ω₀ = 0.0 (sovereign verdict).
- [Q]: Should APEX have a public surface?
- [CONTEXT]: Sovereign decision 2026-05-16: No. APEX is internal-only. All public A2A traffic routes through AAA at aaa.arif-fazil.com. Ω₀ = 0.0 (sovereign veto).
- [Q]: Fix APEX→GEOX auth mismatch (ED25519 vs JWT)?
- [CONTEXT]: Documented in CONTEXT.md §6.7. Resolution: normalize through AAA-A2A rather than direct HTTP. Ω₀ = 0.5 (medium — implementation not started).


## 9. PIPELINE PREFETCH (NEXT MOVES)

- [ ] Document APEX→GEOX transport matrix (auth format per MCP endpoint)
- [ ] Add A2A routing skill for APEX→GEOX via AAA-A2A
- [ ] Expand test coverage beyond config.js
- [ ] Consider adding TypeScript + linting


---

*🪙 GOLD SEAL | METABOLIC KERNEL v1.0 | arifOS AAA | 888 JUDGE VETO | DITEMPA BUKAN DIBERI*
*Readable by: single human · couple · company · institution · AI agent · machine · team · civilisation intelligence*
