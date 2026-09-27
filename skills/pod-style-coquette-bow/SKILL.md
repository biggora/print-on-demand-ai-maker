---
name: pod-style-coquette-bow
description: Create an original romantic POD illustration using bows and ribbons as an intentional motif when requested.
---

# Coquette Bow Illustration

Use only when the brief supports a bow/ribbon-led romantic look. Do not add a bow to unrelated concepts by default.

## Art direction

- Choose one prominent well-formed bow or a small, coherent group of ribbons and objects. Loops, knot, and tails should be visibly distinct.
- Use soft romantic tones such as dusty rose, cream, and wine, with a stronger outline where pale colors meet.
- A satirical combination with an ordinary object is welcome when the brief calls for humor; do not let extra decorations overwhelm it.
- Avoid endless ribbon loops, unreadable lace, trademarked fashion motifs, and incidental text.

## Generation

For an image request, use built-in ImageGen to make one master design, not variants or product mockups.

Prompt scaffold: Original romantic print illustration of {subject} with one clearly tied bow or coherent ribbon motif, readable loops knot and tails, dusty-rose cream and wine palette, delicate but print-safe outlines, compact centered design, isolated transparent background.

Use 1:1 or 5:6 canvas, default 5:6, max 4500×5400 px. Smaller generation is fine; never stretch or silently crop. Reuse the same master on compatible POD products.

Check bow construction, readability, contrast, ratio, and background. Do not infer legal clearance from historical demand signals.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
