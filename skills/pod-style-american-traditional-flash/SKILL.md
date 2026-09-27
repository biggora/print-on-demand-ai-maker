---
name: pod-style-american-traditional-flash
description: Create an original tattoo-flash-inspired POD graphic with bold outlines, separated spot colors, and a clear central emblem.
---

# American Traditional Tattoo Flash

Use for a tattoo-flash-inspired image, not for copying a particular tattoo artist or existing flash sheet.

## Art direction

- Center one archetypal subject with a bold dark outline, flat separated spot colors, simple shadow shapes, and optional stars or a blank banner.
- Keep the silhouette recognizable at a distance. Use a compact palette and broad lines that will not close up on fabric.
- Create new compositions and wording. Use cultural or sacred motifs only when the brief gives context and the depiction is appropriate.
- Avoid named artist references, traced flash, logos, and slogans tied to real shops or organizations.

## Generation

For an image request, use built-in ImageGen to create exactly one master print, not a product mockup or a batch.

Prompt scaffold: Original American-traditional tattoo-flash-inspired print of {subject}, bold dark outline, compact separated spot colors, clear central silhouette, simple controlled shadow shapes, optional blank banner, isolated transparent background, no copied flash sheet or artist reference.

Use 1:1 or 5:6, default 5:6, no larger than 4500×5400 px. Never stretch or silently crop; reuse the same master on compatible items.

Check outline continuity, distinct color regions, recognizable silhouette, ratio, and absence of stray text. Do not imply rights clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
