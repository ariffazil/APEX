# TODO — HERMES ASI Relay

> **Roadmap:** ARIFOS_NEXT_HORIZON_2026  
> **Execution Status:** HOLD until contracts frozen  
> **Last Updated:** 2026-05-10  
> **Seal:** DITEMPA BUKAN DIBERI

---

## ✅ Embodiment Attestation (Completed Earlier Today)

- [x] arifOS embodiment contracts deployed
- [x] Model registry fix

---

## 🔴 P0 — Horizon 0: Canon Lock (Days 0–14)

**Gate: No new features until contracts are frozen.**

### Authority Freeze
- [ ] **Create `REPO_AUTHORITY_MATRIX.md`** — what HERMES may own / must not own
- [ ] **Deliberation contract** — HERMES recommends; arifOS judges; Arif decides
- [ ] **Model inventory** — map all models in fallback chain

---

## 🟠 P1 — Horizon 1: Security + Session Spine (Days 15–45)

**Gate: Constitution hash verified on every handshake. No unregistered models.**

### A2A Security
- [ ] **Constitution hash propagation** — verify on every A2A handshake
- [ ] **Block rogue agents** — mismatched constitution hash = reject
- [ ] **Log handshake failures** — to VAULT999 for forensic analysis

### Model Registry
- [ ] **Auto-sync with arifOS model registry** on container start
- [ ] **Local cache of approved models** + fallback chain
- [ ] **Reject unknown models** — `EMBODIMENT_HOLD` for unregistered models

### Fallback Validation
- [ ] **Test SEA-LION → Ollama → rule fallback** end-to-end
- [ ] **Verify fallback triggers** when primary model times out
- [ ] **Latency budget** — each fallback tier < 500ms additional

---

## 🟡 P2 — Horizon 2: Deterministic Judge (Days 46–90)

**Gate: Causal reasoning, not plain RAG.**

### Causal Templates
- [ ] **GEOX → WEALTH** — reservoir uncertainty affects EMV
- [ ] **WEALTH → A-FORGE** — capital risk affects execution permission
- [ ] **WELL/AAA → arifOS** — operator state affects escalation threshold

### Causal Output Format
- [ ] Every causal analysis returns:
  ```json
  {
    "claim": "...",
    "causal_graph_id": "...",
    "intervention_tested": "...",
    "counterfactual": "...",
    "uncertainty": "...",
    "evidence_refs": [],
    "recommended_verdict": "HOLD"
  }
  ```

### Deliberation Hardening
- [ ] **F9 ANTI-HANTU enforcement** — no consciousness claims in deliberation output
- [ ] **Timeout enforcement** — deliberation within arifOS latency budget
- [ ] **Deterministic deliberation audit** — verify config.json matches runtime

---

## 🟢 P3 — Horizon 3: Semantic Federation (Days 91–135)

**Gate: Multi-model deliberation with epistemic uncertainty.**

- [ ] **Multi-model deliberation** — query 3+ models, constitutional weighting
- [ ] **Disagreement detection** — flag when models disagree > 2σ
- [ ] **Epistemic uncertainty reporting** — model disagreement as confidence metric
- [ ] **Direct MCP bridge** — `arif_hermes_deliberate` tool registration
- [ ] **Verdict lineage** — every output carries arifOS receipt_id

---

## 🔵 P4 — Horizon 4: Self-Healing + Release (Days 136–180)

**Gate: Distributed deliberation without authority expansion.**

- [ ] **Distributed deliberation** — shards across regions with consistency guarantees
- [ ] **Open deliberation protocol** — publish as open standard
- [ ] **Public docs cleanup**
- [ ] **Release tag `vNext-Horizon-0`**

---

**DITEMPA BUKAN DIBERI — Deliberation is forged, not given.**
