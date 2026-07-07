# ZONUERT Bugs

Short gateway bug/risk list. Full details live in [docs/BUGS.md](docs/BUGS.md).

## Known / Deferred

- Vite main chunk warning remains deferred; latest build reported main JS around 596 kB.
- Favicon 404 has been observed as non-breaking.
- V6F.1 production organism canvas is not implemented yet.
- Old/new canvas integration can affect camera, labels, and fallback behavior.
- WebGL lifecycle risks: context loss, DPR, resize, cleanup, and fallback.
- Table sync must be rechecked after V6F.1.
- Mobile dock/label/right-panel layout remains a risk.

Do not invent severe bugs without reproduction. Add real defects to [docs/BUGS.md](docs/BUGS.md).
