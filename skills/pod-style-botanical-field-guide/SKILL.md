---
name: pod-style-botanical-field-guide
description: Create original botanical, fungi, or wildlife POD art with field-guide composition and print-safe watercolor or ink detail.
---

# Botanical and Naturalist Field Guide

Use for nature subjects presented as a specimen illustration or a small field-guide collection.

## Art direction

- Show one specimen or a few related plants, fungi, insects, or animals. Use carefully observed forms, restrained watercolor/pencil pigments, or fine print-safe hatching.
- Arrange specimens with clear spacing. Keep the background transparent instead of simulating a paper page.
- Ask for exact species only when scientific accuracy matters. Do not invent Latin names, labels, or factual claims; leave labels out by default.
- Avoid microscopic detail, generic filler flowers, and pale strokes that vanish on fabric.

## Generation

For an image request, use built-in ImageGen to create exactly one master print, not variants or product mockups. Ask only for a missing subject, exact species, ratio, or garment color.

Prompt scaffold: Original field-guide illustration of {specified plant, fungi, insect, or animal}, carefully observed forms, fine but print-safe ink hatching with restrained watercolor or pencil pigments, balanced specimen arrangement, muted natural colors, no paper backdrop, isolated transparent background, no labels unless supplied.

Use 1:1 or 5:6 canvas, default 5:6, within 4500×5400 px. Never stretch or silently crop; reuse the master on compatible products.

Check subject recognizability, label accuracy if any, line visibility at print size, ratio, and background. Do not state that factual or rights clearance is complete.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
