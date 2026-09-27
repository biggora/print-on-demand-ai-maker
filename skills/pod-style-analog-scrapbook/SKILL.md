---
name: pod-style-analog-scrapbook
description: Create an original analog scrapbook POD collage from personal, invented, or authorized imagery and ephemera.
---

# Analog Scrapbook and Mixed Media

Use for a layered journal or scrapbook visual. Create the impression of tactile paper pieces without turning the print into an accidental full-page rectangle.

## Art direction

- Combine a few cutouts, tape shapes, stamp-like marks, snapshot frames, and handwriting areas with a clear focal subject.
- Use intentional layers, irregular edges, and a coherent muted palette. Keep the outer canvas transparent unless a full-bleed page is explicitly requested.
- Use invented or authorized material. Leave handwriting blank unless exact text is supplied.
- Avoid real postal seals, brand packaging, copyrighted photos, personal data, false historical captions, and pseudo-handwriting clutter.

## Generation

For an image request, use built-in ImageGen for exactly one master design, not mockups or a batch of alternatives.

Prompt scaffold: Original analog scrapbook-inspired T-shirt collage about {subject}, a few layered paper-cut shapes, stamp-like motifs and tape details, tactile imperfect edges, {palette}, clear focal hierarchy, transparent outer area, no real stamps, logos, or accidental text.

Use 1:1 or 5:6 canvas, default 5:6, within 4500×5400 px. Do not stretch or silently crop. Reuse the master on compatible POD products.

Check hierarchy, stray readable text, privacy, ratio, and whether texture is contained in the collage shapes. Do not claim legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
