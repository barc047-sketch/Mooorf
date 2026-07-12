# V8.2C0 Desktop Manual QA

Run at 1440 desktop and 1280 laptop only. For each check mark one verdict.

| # | Check | 1440 | 1280 |
|---|---|---|---|
| 1 | Screen labels keep a stable apparent size while zooming; Adaptive clamps and World scales intentionally. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 2 | Auto Contrast uses dark text on light cells and light text on dark/void cells. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 3 | Pan tracks the pointer smoothly without label stutter. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 4 | Wheel zoom remains smooth and cursor-centred. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 5 | Single-cell drag previews smoothly and commits only on release. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 6 | A 10-cell selection moves as one rigid translation with unchanged offsets. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 7 | One Undo restores the completed group drag. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 8 | One Redo reapplies the completed group drag. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 9 | Selecting an already-open widget raises it immediately without remount/entrance replay or position loss. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 10 | Widget, dock, rail, and contextual glass is blurred on its first visible frame. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 11 | Touched UI surfaces have keylines but no box/drop shadows or blur animation. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 12 | Cell Shadow Off/Soft/Defined affects appearance only; Fast forces it off. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 13 | A blank/new project starts with Morph off and plain selectable/draggable cells. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 14 | Motion starts off; direct manipulation remains immediate. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 15 | Right-click actions originate at the projected cell centre; edge actions remain visible with no centre/background object. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 16 | Classic parity: drag, labels, contrast, shadows, inline editor, radial, and selection remain correct. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 17 | Organism parity: plain/Morph modes, drag, labels, contrast, shadows, editor, radial, and selection remain correct. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |
| 18 | No top/bottom future-shell redesign appears; PNG/PDF/SVG capture remains deterministic and respects shadow export inclusion. | [ ] YES [ ] NO [ ] PARTIAL | [ ] YES [ ] NO [ ] PARTIAL |

