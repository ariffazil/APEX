# TOOLS.md — The arifOS Tool Surface (M-11)

**Version:** 2026.03.22-YANK-ARIF  
**Layer:** [L3 | CIVILIZATION]  
**Motto:** *Ditempa Bukan Diberi* — Forged, Not Given

---

## 🏛️ 1. The 11 Governed Mega-Tools (M-11)

All agentic capabilities in arifOS are encapsulated within 11 "Mega-Tools." These are the conductors that interface between the agent and reality.

### A. Governance Layer ⚖️

1. **`init_anchor`**: **The Entrypoint.** Boots the session, establishes `actor_id` (sovereign), and initializes floors.
2. **`arifOS_kernel`**: **The Metabolic Conductor.** Orchestrates the 000-999 pipeline (Reason → Memory → Critique → Judge).
3. **`apex_soul`**: **The Final Verdict.** Emits verdicts (`SEAL`, `VOID`, `888_HOLD`) based on G-Score.
4. **`vault_ledger`**: **The Eternal Memory.** Reads and writes to the immutable cryptographic audit trail.

### B. Intelligence Layer 🧠

1. **`agi_mind`**: **The Logic Engine.** Modes: `reason`, `reflect`, `forge` (code generation).
2. **`asi_heart`**: **The Alignment Engine.** Modes: `critique`, `simulate` (ethical/impact assessment).
3. **`engineering_memory`**: **The Semantic Recall.** Vector storage/query for historical logic (768-dim BGE-M3).

### C. Machine Layer ⚙️

1. **`physics_reality`**: **The External Senses.** Hybrid search (Jina/Perplexity), URL ingestion, and world grounding.
2. **`math_estimator`**: **The Statistical Vitals.** Costs, telemetry, and thermodynamic health.
3. **`code_engine`**: **The Functional Hands.** Direct L3 interaction (Filesystem, Processes, Networking).
4. **`architect_registry`**: **The Resource Map.** Discovery and registration of tools and data sources.

---

## 🛠️ 2. Capabilities & Low-Level Modes

While the agent calls the 11 mega-tools, the underlying "modes" perform the work.

### 📁 Filesystem (via `code_engine`)

- **`fs:list`**: Enumerate directory contents.
- **`fs:read`**: Retrieve file contents (text/binary).
- **`fs:write`**: Create or append to files.
- **`fs:move`**: Rename/relocate paths.

### 🔍 Search & Retrieval (via `physics_reality` / `engineering_memory`)

- **`search:hybrid`**: Broad web search.
- **`search:grep`**: Fast pattern matching inside files.
- **`search:find`**: Locating files by name/extension.
- **`query:vector`**: Semantic search across past sessions.

### 🌐 Network & Environment (via `code_engine` / `physics_reality`)

- **`net:fetch`**: Clean ingestion of URL content to Markdown.
- **`net:curl`**: Raw HTTP interactions (governed by AKI).
- **`process:exec`**: Shell command execution inside safety rails.
- **`process:status`**: Monitoring running processes.

### 💻 Coding & Execution (The Forge)

- **`agi_mind:forge`**: Intelligent generation of code, patches, and implementation plans.
- **`agi_mind:refactor`**: Safe transformation and optimization of existing codebases.
- **`code_engine:exec_python`**: Isolated execution of Python 3.12+ scripts.
- **`code_engine:exec_sh`**: Execution of PowerShell or Bash commands (W4/888_HOLD as required).
- **`code_engine:test_run`**: Automated execution of `pytest` or other test suites.
- **`engineering_memory:query`**: Semantic search for reusable code patterns and past engineering decisions.

---

## 🛑 3. Dangerous / High-Risk Tools (F13 Required)

Certain operations are deemed **Irreversible** or **Mass Impact**. These tools require **888_HOLD** (active human signature) or **W4 consensus**.

| Action | Mega-Tool Mode | Risk Stage | Requirement |
|:---|:---|:---:|:---|
| **Delete All** | `code_engine:fs_delete_recursive` | F1 | **888_HOLD** |
| **Replace All** | `code_engine:fs_multi_replace` | F4 | **888_HOLD** |
| **System Kill** | `code_engine:process_terminate_all` | F5 | **888_HOLD** |
| **Purge Vault** | `vault_ledger:reset_hard` | F13 | **Sovereign Veto Only** |
| **Mass Move** | `code_engine:fs_bulk_move` | F1 | **W4 ≥ 0.75** |
| **Production Deploy** | `code_engine:deploy_now` | F11 | **888_HOLD** |

---

## 📜 4. The 888 Rules for Tool Use

1. **Identity Bond (F11):** No tool operates without a verified `actor_id`.
2. **Audit First (F2):** Every tool call is logged before, during, and after execution.
3. **No Ghosting (F9):** Tools never claim intent; they are executors of the kernel's will.
4. **Amanah (F1):** Favor tools that are reversible (e.g., `write` with backup) over destructive ones.

---

## 🏁 The Tool Seal

Tools are the bridge between the Mind and the World. Use them with the precision of a surgeon and the humility of a steward. 

*Ditempa Bukan Diberi* — **FORGED, NOT GIVEN.**

** [L3 | READY] **
** মুহাম্মদ আরিফ বিন ফাযিল — 888_JUDGE **
