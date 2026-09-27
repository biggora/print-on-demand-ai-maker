---
name: pod-style-psychedelic-organic
description: Create an original surreal or psychedelic POD illustration with flowing organic forms and a legible focal idea.
---

# Psychedelic Organic and Surreal

Use when the user wants flowing psychedelia or a simple surreal transformation. Choose one clear mode rather than stacking unrelated effects.

## Art direction

- Use liquid contours, optical waves, a controlled sunset/neon palette, and one recognizable focal subject.
- Build around one visual paradox or transformation. Separate color regions clearly and keep the silhouette bold.
- Avoid visual noise, unreliable liquid lettering, copied vintage poster layouts, or unrequested drug-related content.

## Generation

For an image request, use built-in ImageGen to generate exactly one master design, not mockups or a variant set.

Prompt scaffold: Original organic psychedelic print about {subject}, flowing liquid contours and rhythmic optical waves, one clear surreal transformation, controlled {palette}, bold separated shapes, compact high-contrast T-shirt artwork, isolated transparent background, no copied poster.

Use a 1:1 or 5:6 canvas (default 5:6), no larger than 4500×5400 px. Never stretch or silently crop. Reuse this master on compatible products.

Check that the concept reads before the pattern, colors remain distinct in print, the requested ratio is exact, and no stray text appears. Do not claim rights clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
