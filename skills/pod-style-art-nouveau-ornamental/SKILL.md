---
name: pod-style-art-nouveau-ornamental
description: Create an original POD illustration with flowing Art Nouveau-era organic contours and ornament, without copying a named artist or poster.
---

# Art Nouveau Ornamental

Use for organic ornamental poster traits translated into a compact apparel print. Describe the visual properties rather than asking to imitate an artist.

## Art direction

- Use flowing botanical curves, an ornamental halo or frame, balanced vertical rhythm, and elegant flat color regions.
- Center one original figure, plant, or object. A figure is optional; avoid borrowing a famous pose, costume, or poster layout.
- Limit the palette and strengthen narrow contours for textile printing. Let curves lead toward the focal subject instead of competing with it.
- Do not copy signatures, protected characters, or a specific artist's composition.

## Generation

For an image request, use built-in ImageGen for one master, not product mockups or variant batches.

Prompt scaffold: Original Art Nouveau-inspired T-shirt illustration of {subject}, flowing organic contours, balanced ornamental botanical frame, elegant flat shapes, limited {palette}, print-safe linework, distinct original composition, isolated transparent background, no named-artist imitation or copied poster.

Use 1:1 or 5:6 (default 5:6), within 4500×5400 px. Never stretch or silently crop. Reuse the master on compatible products.

Check that ornament frames rather than obscures the subject, lines are printable, ratio is correct, and no stray text appears. Do not claim legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
