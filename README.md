# Premotion

> **We try to lose your case for you. So you don't.**
>
> Adversarial premortem for UK litigation. Premotion synthesises the lost version of your case, then runs multi-model analysis on why we lost. Eight specialists, four failure categories, one brief. For solicitors, in-house counsel, mediators and litigation funders.

**[Live demo →](https://premotion.io)**

You think you've built the strongest version of your case. Premotion runs it through a structured adversarial pipeline of orchestrated sub-agents to find out where it actually loses — the procedural, substantive, evidentiary and strategic failure modes opposing counsel will pull on first.

Output: a stress-test brief with ranked failure modes by category, evidence inconsistencies, blind spots, mitigations, and one brutal sentence — *"if we lose this, this will be why."*

## Who it's for

- Solicitors at boutique and mid-size UK firms running active litigation
- In-house counsel weighing whether to escalate
- Mediators wanting a third-voice red team on positions
- Litigation funders evaluating cases pre-investment

Not designed for consumer disputes, family law, or criminal defence.

## Architecture

```
Orchestrator (FastAPI)
│
├── Stage 1 · OptimisticAnalyst  (Sonnet)
│     The strongest version of the client's case the evidence supports.
│
├── Stage 2 · EvidenceInspector  (parent — runs three sub-agents in parallel)
│     ├── DocumentSubAgent          (Sonnet)
│     ├── CrossReferenceSubAgent    (Sonnet)
│     └── ChronologySubAgent        (Sonnet)
│     Output: merged evidence flags with severity
│
├── Stage 3 · PremortemAdversary (parent — runs four Opus sub-agents in parallel)
│     ├── ProceduralSubAgent        (Opus)
│     ├── SubstantiveSubAgent       (Opus)
│     ├── EvidentiarySubAgent       (Opus)
│     └── StrategicSubAgent         (Opus)
│     Each is told: "It is January 2027. The case has been LOST. Walk back."
│     Output: ranked failure scenarios by category
│
└── Stage 4 · Synthesizer (Sonnet)
      Diffs the optimistic case against the adversarial findings.
      Produces the brief: verdict (steelman / strawman / borderline),
      ranked failure scenarios, evidence inconsistencies, blind spots,
      mitigations, and the one brutal sentence.
```

Seven LLM calls under the hood. Two parallel `asyncio.gather` blocks. End-to-end ~2–3 minutes per real case.

Per-class model selection — every agent class declares its own model via env var. Swapping Opus for a local Gemma is one line of config, not a routing layer.

Every sub-agent call is audit-logged independently — model, tokens in, tokens out, duration, status. You can answer "which sub-agent flagged this?".

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + React Router |
| Backend | FastAPI + async Anthropic SDK |
| Orchestration | Python `asyncio.gather` for parallel sub-agents |
| Model routing | `BaseAgent` env-config per agent class |
| Database | SQLite (Postgres for V2) |
| Document extraction | PyMuPDF + python-docx |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Local development

```bash
# Frontend
npm install
npm run dev   # http://localhost:5173

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
ANTHROPIC_API_KEY=sk-... uvicorn app.main:app --reload --port 8000
```

Frontend proxies `/api` → `http://localhost:8000` in dev.

## Environment

Backend env vars:

| Var | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | required |
| `PREMOTION_OPTIMISTIC_MODEL` | `claude-sonnet-4-20250514` | Stage 1 model |
| `PREMOTION_EVIDENCE_MODEL` | `claude-sonnet-4-20250514` | Stage 2 sub-agents |
| `PREMOTION_PREMORTEM_MODEL` | `claude-opus-4-20250514` | Stage 3 sub-agents (Opus) |
| `PREMOTION_SYNTHESIS_MODEL` | `claude-sonnet-4-20250514` | Stage 4 model |
| `PREMOTION_SONNET_TIMEOUT` | `60` | seconds |
| `PREMOTION_OPUS_TIMEOUT` | `120` | seconds |

Legacy `STEELMAN_*` env names are still honoured by the config loader so existing Render deployments don't need to be reconfigured.

## Phased delivery

- **V1 — MVP (live).** Splash, intake, full pipeline, brief render, two baked demos, audit log. Solicitor / in-house / mediator / litigation funder positioning.
- **V2 — Polish + persistence.** Magic-link auth, save/revisit cases, export brief as PDF, public launch.
- **V3 — Bird Legal integration.** Premotion as a tab inside the Bird Legal Litigation Advisor. Cross-product evidence sharing. Run a stress-test from a matter workspace with one click.
- **Future — multi-modal.** Image evidence (Claude vision). Audio (Whisper transcription). Video frame sampling. Local model deployment (Gemma 3 / Llama) for on-prem firms.
- **Future — domain depth.** Custom failure-mode taxonomies per practice area. Cross-case learning / institutional memory layer.

## Roadmap themes

- Streaming UI showing sub-agent progress in real time (currently a rotating status message).
- Per-firm fine-tuning of the synthesizer for house style.
- Linked-citation rendering against The National Archives' Find Case Law API.
- API for Bird Legal and other matter-management systems to invoke Premotion from a matter.

## Sister products

- [Courtless](https://github.com/b1rdmania/courtless) — disputes without courts. Consumer-side mediation protocol for under-£100K disputes.
- [Counsel](https://github.com/b1rdmania/counsel-mvp) — pre-mediation triage for solicitors.

Premotion, Courtless and Counsel form a portfolio of legal AI products by [b1rdmania](https://github.com/b1rdmania), each at a different point on the matter lifecycle. Premotion sits between intake and pleading. It's the red team you don't have on retainer.

## What it doesn't do

- Does not give legal advice. The decision on what to file or argue remains with the instructed solicitor.
- Does not search case law or cite authority — it stress-tests your strategy, not the law.
- Does not handle criminal defence, family law, or consumer disputes.
- Does not persist cases between sessions in V1 (auth and save/revisit in V2).

## License

MIT
