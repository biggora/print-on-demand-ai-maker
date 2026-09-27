---
name: pod-style-soft-animal-pattern
description: Create an original POD motif inspired by animal markings in a muted palette, without copying a fashion-house pattern.
---

# Soft Animal Pattern

Use for stylized animal-marking patterns or a bounded animalier emblem. Clarify whether the user wants a repeat or a single graphic if that choice is unclear.

## Art direction

- Use abstract spots, stripes, or scales in a soft palette such as cream, cocoa, sage, or dusty rose.
- Make the pattern original through mark shape, spacing, and color. For a chest print, contain it in one clear shape or pair it with an original animal silhouette.
- Keep the marks flat and bold enough to reproduce; photorealistic fur is unnecessary.
- Do not mimic luxury-house prints, monograms, trade dress, or a known branded pattern.

## Generation

For an image request, use built-in ImageGen to generate one master artwork, not mockups or a batch. Preserve the selected square or portrait canvas.

Prompt scaffold: Original stylized animal-inspired {spot, stripe, or scale} print motif, soft muted {palette}, hand-drawn irregular marks, clear repeat rhythm or bounded emblem as requested, flat print-friendly shapes, isolated transparent outer area, no luxury pattern or logo.

Use 1:1 or 5:6, default 5:6, maximum 4500×5400 px. Never stretch or silently crop; reuse one master on compatible products.

Check originality, pattern rhythm, edge handling, ratio, and readability at the intended print size. Do not claim legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
