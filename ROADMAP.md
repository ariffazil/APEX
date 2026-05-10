# HERMES — Roadmap H1–H4

**Version:** v2026.05.10  
**Organ:** HERMES (ASI Relay · Deliberation Bridge)  
**Maturity:** PRODUCTION (local, no public remote)  
**Role:** ASI deliberative relay — bridge, model resilience contract  
**Status:** SEALED — pending APEX ratification — **EMBODIMENT-AWARE DELIBERATION**

---

## Executive Summary

HERMES is the ASI deliberative relay of the arifOS federation. As of 2026-05-10, HERMES benefits from kernel-level tool embodiment contracts — all A2A-routed deliberation calls are now lane/tier-verified before execution. HERMES must never become a self-authorizing sovereign override; its authority is bounded by arifOS 888_JUDGE.

**HERMES responsibilities by horizon:**

| Horizon | Theme | HERMES Milestones |
|---------|-------|------------------|
| **H1** (Q2–Q3 2026) | Substrate Hardening | Constitution hash propagation, model registry sync, **treaty verification** |
| **H2** (Q4 2026–Q1 2027) | Recursive Governance | Multi-model deliberation, epistemic uncertainty |
| **H3** (Q2–Q3 2027) | AGI-Scale Runtime | Distributed deliberation across regions |
| **H4** (Q4 2027+) | Foundational Substrate | Open deliberation protocol standard |

---

## What Changed (2026-05-10)

### ✅ Deployed
- **arifOS embodiment contracts** — HERMES deliberation calls verified at kernel level
- **Model registry fix** — `gpt-5.5-thinking` resolves for governance attestation

### 🔄 Active Frontier
- Constitution hash propagation on A2A handshake
- Model fallback chain validation (SEA-LION → Ollama → rule)
- Direct MCP bridge to arifOS

---

## H1: Substrate Hardening (Q2–Q3 2026)

### H1.1 — A2A Treaty Verification

HERMES is the A2A mesh bridge. Every handshake must include constitution hash verification to prevent rogue agent injection.

**Required:**
- Verify incoming agent's constitution hash matches federation canonical hash
- Block agents with mismatched or missing hash
- Log all handshake failures to VAULT999

### H1.2 — Model Registry Sync

HERMES must never infer from an unregistered model.

**Required:**
- Auto-sync with arifOS model registry on container start
- Maintain local cache of approved models + fallback chain
- Reject unknown models with `EMBODIMENT_HOLD`

### H1.3 — Deterministic Deliberation Hardening

The deliberation server must never drift from constitutional constraints.

**Required:**
- Deliberation mode audit — verify `config.json` matches runtime
- Timeout enforcement — deliberation within arifOS latency budget
- F9 ANTI-HANTU enforcement — no consciousness claims in deliberation output

---

## H2: Recursive Governance (Q4 2026 – Q1 2027)

### H2.1 — Multi-Model Deliberation

Query 3+ models, aggregate with constitutional weighting.

**Required:**
- Ensemble deliberation protocol
- Disagreement detection (flag when models disagree > 2σ)
- Epistemic uncertainty reporting

### H2.2 — HERMES ↔ arifOS Direct Bridge

Expose HERMES deliberation as a first-class arifOS MCP tool.

**Required:**
- `arif_hermes_deliberate` tool registration
- Verdict lineage — every output carries arifOS receipt_id
- Floor enforcement at deliberation boundary

---

## H3: AGI-Scale Runtime (Q2–Q3 2027)

### H3.1 — Distributed Deliberation

Deliberation shards across geographic regions with consistency guarantees.

---

## H4: Foundational Substrate (Q4 2027+)

### H4.1 — Open Deliberation Protocol

Publish HERMES deliberation protocol as open standard for third-party integration.

---

**DITEMPA BUKAN DIBERI — Deliberation is forged, not given.**

*SEALED: 2026-05-10 | HERMES ASI Relay — Embodiment-Aware*
