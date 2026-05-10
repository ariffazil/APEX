# TODO — HERMES ASI Relay

> **Last Updated:** 2026-05-10  
> **Session:** Governance Attestation + Deliberation Bridge  
> **Seal:** DITEMPA BUKAN DIBERI

---

## ✅ Completed This Session

- [x] **arifOS embodiment contracts** deployed — HERMES-orchestrated deliberation now lane/tier-verified
- [x] **Model registry fix** — `gpt-5.5-thinking` resolves for governance attestation

---

## 🔴 P0 — Critical (Before Next Session)

### A2A Treaty Verification
HERMES is the A2A mesh bridge. Currently no signed delegation contracts.

- [ ] **Verify all A2A handshakes** include constitution hash verification
- [ ] **Block agents** with mismatched constitution hash — prevents rogue injection
- [ ] **Log handshake failures** to VAULT999 for forensic analysis

### Deterministic Deliberation Hardening
The deliberation server must never drift from constitutional constraints.

- [ ] **Deliberation mode audit** — verify `config.json` mode matches runtime behavior
- [ ] **Model contract validation** — every inference request checks model against registry
- [ ] **Timeout enforcement** — deliberation must complete within arifOS latency budget

---

## 🟠 P1 — High (Next 7 Days)

### Constitution Hash Propagation
- [ ] **Broadcast constitution hash** on every A2A handshake
- [ ] **Cache verified agent hashes** — avoid re-verification on every call
- [ ] **Invalidate cache** when arifOS issues new constitution epoch

### SEA-LION Resilience Contract
- [ ] **Test fallback chain** — SEA-LION → Ollama → rule fallback
- [ ] **Verify fallback triggers** when primary model times out or errors
- [ ] **Latency budget:** each fallback tier < 500ms additional

---

## 🟡 P2 — Medium (Next 30 Days)

### HERMES ↔ arifOS Integration
- [ ] **Direct MCP bridge** — HERMES exposes deliberation as arifOS tool
- [ ] **Verdict lineage** — every HERMES deliberation output carries arifOS receipt_id
- [ ] **Floor enforcement** — HERMES deliberation respects F9 ANTI-HANTU (no consciousness claims)

### Model Registry Sync
- [ ] **Auto-sync** with arifOS model registry on container start
- [ ] **Fallback model list** — maintain local cache of approved models
- [ ] **Reject unknown models** — never infer from unregistered model

---

## 🟢 P3 — Backlog (H2 2026)

### Multi-Model Deliberation
- [ ] **Ensemble deliberation** — query 3+ models, aggregate with constitutional weighting
- [ ] **Disagreement detection** — flag when models disagree > 2σ
- [ ] **Epistemic uncertainty** — report model disagreement as confidence metric

---

**DITEMPA BUKAN DIBERI — Deliberation is forged, not given.**
