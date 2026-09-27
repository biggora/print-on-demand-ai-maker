---
name: pod-style-western-americana
description: Create an original Western-inspired POD graphic with broad desert or ranch cues and no real organization branding.
---

# Western and Americana

Use when the brief calls for Western, ranch, desert, or road-trip imagery. Select a few relevant visual cues rather than assembling every cliché.

## Art direction

- Choose one strong silhouette such as a desert horizon, cactus, boot, star, or roadside object; pair it with sun-faded colors and optional hand-painted type.
- Use a coherent warm palette and print-friendly details. Keep national or regional flags out unless the user requests them.
- Avoid real rodeo marks, state seals, vehicle and music logos, borrowed slogans, and unintended patriotic messaging.

## Generation

For image creation, use built-in ImageGen to create one master print only, not mockups or variant batches. Preserve supplied wording exactly.

Prompt scaffold: Original Western Americana T-shirt graphic about {subject}, one strong {desert or ranch motif}, a few purposeful frontier symbols, sun-faded {palette}, hand-painted lettering space only for {exact supplied phrase}, bold print-friendly shapes, isolated transparent background, no real brand or seal.

Use 1:1 or 5:6 (default 5:6), maximum 4500×5400 px. Never stretch or silently crop. Reuse the master on compatible products.

Check that the Western cue is clear without clutter, text is exact, and the silhouette reads small. Do not claim marketplace rights clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
