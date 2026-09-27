---
name: pod-style-dark-romantic-emblem
description: Create a gothic or dark-academia POD emblem with a readable center, restrained ornament, and contrast suited to dark garments.
---

# Dark Romantic and Academia Emblem

Use for gothic, witchy, or dark-academia visual language. Build an original emblem; a tarot-like frame is optional composition, not a request to copy a card.

## Art direction

- Center a night-natural or scholarly symbol, balance a few side ornaments, and use moon or botanical detail only when relevant.
- Combine ivory/light linework with plum, burgundy, ink, or black. Keep the focal subject brighter and larger than the frame.
- Limit filigree and occult references. Avoid accidental pseudo-symbols and dense detail that disappears on fabric.
- Never reproduce a known book, game, tarot card, or franchise emblem.

## Generation

For an image request, use built-in ImageGen to create exactly one master design; do not generate product mockups or multiple variants.

Prompt scaffold: Original dark-romantic emblem about {subject}, readable central {symbol}, balanced gothic botanical ornament, restrained moonlit details, ivory linework with plum and burgundy accents, print-safe contrast, isolated transparent background, no copied card or franchise symbol.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Never stretch or silently crop. Reuse the same master on compatible products.

Check contrast against the intended shirt, focal hierarchy, ratio, stray marks, and thumbnail legibility. Do not imply trademark review or legal approval has happened.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
