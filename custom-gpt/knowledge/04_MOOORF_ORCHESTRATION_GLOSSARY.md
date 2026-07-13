# MOOORF Orchestration Glossary — Knowledge Upload 04

## Owner

The user. Final authority over product decisions, pushes, worker dispatch and merges.

## Project Manager

The Custom GPT. Reads GitHub, protects scope, prepares contracts, routes workers, reviews results and explains decisions simply.

## Worker

A coding or audit agent executing one approved contract on one branch.

## Assignment states

- ASSIGNED — a worker has an approved task.
- UNASSIGNED — no active approved task.

## Execution states

- START NOW — approved and ready for the Owner to dispatch.
- RUNNING — confirmed by live status branch.
- WAITING_REVIEW — implementation is pushed and awaits independent review.
- DONE — completed read-only task or merged/closed task as defined by its gate.
- HOLD — intentionally idle.
- BLOCKED — cannot continue without resolution.
- ABORTED — session/task stopped; do not continue in the exhausted session.

## CAVEMAN

Compact contract design:

- Context pointers
- Atomic objective
- Verifiable acceptance
- Exact files
- Modification limits
- Abort conditions
- New-session declaration

CAVEMAN does not mean broken language. It means concise, exact and low-context.

## HEADROOM

Context protection system. It limits reading, reserves context, uses fresh sessions at phase boundaries and requires handoff capsules rather than pasted history.

## PONYTAIL

Reuse discipline. Every task reports what was reused, adapted, newly justified and kept free of duplication.

## Contract

The approved task file containing exact base SHA, branch, read/write allowlists, scope, limitations, tests, stop conditions and output.

## Skeleton contract

A dependency-gated future brief without a resolved source SHA. It cannot be executed until activated.

## Handoff capsule

Small state package for a fresh worker session: active contract, exact SHAs, allowlists and directly relevant report/audit only.

## Delta audit

Independent review of a feature branch against its exact source SHA. It focuses on changed files, contracts, tests and forbidden scope.

## Owner QA

Fast human review of visual/interaction behaviour. Owner QA complements technical audit; it does not replace it.

## Merge candidate

An audited feature head that may be proposed to the Owner for merge. It is not automatically approved.

## Later scope

Approved and preserved future idea under `docs/later-scope/`. Later scope is not current implementation permission.

## Prototype

Isolated design exploration. It may prove interaction/visual direction but does not prove production state, persistence, history, export, renderer parity or performance.

## Production

Code connected to canonical state, persistence, history, renderers, exports and tests on a feature branch based on verified main.

## Master Graph

The central spatial data brain. Tables, Canvas and analytics are views over it.

## Presentation defaults

Project-level default styles for architectural targets.

## Sparse override

Only changed per-object appearance values. Missing values inherit project defaults/legacy truth.

## Architectural targets

- Cell
- Boundary
- Membrane
- Membrane Edge
- Core
- Void

## Connection concepts

- Relationship — semantic meaning
- Visual Connection — drawn line
- Morph Bridge — membrane link
- Cell Behaviour — spatial force/merge rules

## Annotation Card

Standalone Canvas markup card with optional transparent PNG logo, Heading and Body. No Linked Callout object exists.

## Flag

Cell Label Layout preset with direction and adjustable distance.

## Boot

`BOOT MOOORF` starts GitHub verification and compact dashboard generation in a fresh Custom GPT chat.
