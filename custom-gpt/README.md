# MOOORF Custom GPT Transfer OS

This directory turns the MOOORF Project Manager into a Git-backed operating system that can recover in any new Custom GPT conversation.

## Core rule

- GitHub is live project memory and source of truth.
- The Custom GPT is the Project Manager and orchestrator.
- Knowledge uploads are stable backup context, not live state.
- Worker status branches report execution state.
- Task contracts define the only permitted work.

## Start a new Custom GPT chat

Send:

`BOOT MOOORF`

The GPT must then follow `bootstrap/BOOT_PROTOCOL.md`, verify GitHub, read `state/CURRENT_PROJECT_STATE.json`, inspect worker status branches, compare recorded and live state, and show a compact dashboard before planning.

## Owner authority

The Owner is the final decision-maker. Rough discussion is not approval. No implementation, audit, merge, roadmap change or worker dispatch starts without explicit Owner approval or GO.

## Directory map

- `GPT_INSTRUCTIONS.md` — canonical behaviour for the GPT Instructions field.
- `GPT_SETUP_GUIDE.md` — exact setup steps and required user inputs.
- `bootstrap/` — boot, recovery and read-order rules.
- `state/` — compact current state and schemas.
- `orchestration/` — approval, worker routing, CAVEMAN, HEADROOM, PONYTAIL and overnight rules.
- `templates/` — compact contracts, status, audit, QA and merge gates.
- `knowledge/` — four upload-ready stable knowledge files.
- `validation/` — transfer inventory, completeness matrix, security and test suite.
- `upload-pack/` — files to paste/upload into the Custom GPT builder.

## Safety

Never store secrets, access tokens, `.env` files, OAuth credentials, private keys, passwords or local-only references in this directory.
