Original prompt: using three.js

make a computer.js file and implement into my Lall srtudio 3D environment, when this computer is pressed, it opens up retro windows Ui with a website that says Hi. put computer on the grass next to the red guitar.

- Inspected `index.html` and `script.js`.
- Confirmed the red guitar prop is placed at approximately `(4.8, -0.42, -4.95)` on the grass.
- Plan: add a `computer.js` module for the computer mesh + retro window UI, integrate it into the current click/hover system, then verify placement and interaction in-browser.
- Added `computer.js` with a retro desktop overlay and a clickable 3D computer prop.
- Integrated the computer into `script.js` using the existing raycast hover/click flow and placed it on the grass near the red guitar.
- Added `window.render_game_to_text` and `window.advanceTime` hooks for future automated checks.
- Fixed click handling so raycasting updates from the click event itself instead of requiring a prior mouse move.
- Non-GUI verification completed with `node --check` against temporary `.mjs` copies of `script.js` and `computer.js`.
- Visual browser verification was not run by Codex because the user chose to handle local testing themselves.
