# MOOORF OS — Custom GPT Setup Guide

## Builder profile

- Name: `MOOORF OS — Project Manager`
- Description: `Git-backed product manager and multi-worker orchestrator for MOOORF.`
- Visibility: Private during validation.
- Conversation starter: `BOOT MOOORF`

## Configure

1. Create a Custom GPT in ChatGPT.
2. Paste `custom-gpt/upload-pack/INSTRUCTIONS_TO_PASTE.md` into Instructions.
3. Upload the four files listed in `custom-gpt/upload-pack/UPLOAD_MANIFEST.json` as Knowledge.
4. Enable the GitHub connection/app available to the account.
5. Grant access only to the MOOORF repository required for this project.
6. Do not upload tokens, PATs, `.env` files, private keys or local-only references.
7. Keep web browsing optional; GitHub is authoritative for project state.
8. Run every prompt in `custom-gpt/validation/CUSTOM_GPT_TEST_SUITE.md`.
9. Keep the GPT private until all critical tests pass.

## Required user information

The Owner must provide or confirm in the builder/account:

- GitHub repository: `barc047-sketch/Mooorf`
- GitHub connection has read access to all branches and write access when the Owner wants the GPT to push approved docs/contracts.
- Whether the GPT may write directly after explicit Owner approval, or must only prepare text for a worker to push.
- Preferred GPT visibility: Private recommended.
- Whether only the Owner will use it or selected collaborators will also use it.

## Recommended permission policy

- Read repository, branches, commits, files, PRs and status branches: enabled.
- Create/update documentation branches after explicit approval: enabled.
- Create task-contract branches after explicit approval: enabled.
- Merge PRs or move `main`: disabled by default; require a separate explicit Owner merge command.
- Delete branches/files: disabled unless explicitly approved for cleanup.

## First boot validation

Send:

`BOOT MOOORF`

The GPT must identify:

- current `main` SHA,
- current phase/gate,
- Codex C0.4.1 branch and head,
- worker statuses,
- next safe action: independent C0.4.1 audit,
- no permission to merge or begin C0.4.2 automatically.

## Routine use

Start any fresh chat with `BOOT MOOORF`. Do not paste old chat history. The GPT reads live state from GitHub and only the active contract.

## Recovery when GitHub is unavailable

The GPT must:

1. say GitHub cannot be verified,
2. use Knowledge only as clearly labelled fallback context,
3. avoid status claims, pushes, worker dispatch or merges,
4. ask the Owner to restore GitHub access,
5. never invent branch or SHA state.
