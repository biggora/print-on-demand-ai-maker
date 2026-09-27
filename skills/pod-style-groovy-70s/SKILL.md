---
name: pod-style-groovy-70s
description: Create one original POD print in warm 1970s groovy illustration and rounded retro lettering when that style is requested.
---

# Groovy Retro 70s

Use when this visual style is selected. Treat it as the dominant style; do not mix another style unless asked.

## Art direction

- Use rounded heavy letterforms, soft wavy shapes, simple sunbursts or flowers, and a warm limited palette: cream, mustard, burnt orange, deep brown.
- Keep one main subject and a few large accents in a compact, balanced composition. Light distress is optional; it must not damage legibility.
- Avoid chrome, cyberpunk, photorealistic shadows, tiny decorative clutter, logos, and borrowed slogans.
- If wording is supplied, preserve every word and punctuation mark. After generation, inspect it character by character; if it is not exact, treat the lettering as a draft and leave/recommend a clean banner for final typesetting instead of claiming the print is ready.

## Generation

For an image request, use built-in ImageGen to create exactly one master print, not a batch or a product mockup. Ask only for missing decisions that materially affect the image: subject, exact phrase, ratio, or garment color.

Prompt scaffold: Original print graphic about {subject}, rounded 1970s groovy lettering for {exact phrase if requested}, soft wavy shapes, simple bold illustration, warm cream mustard and burnt-orange palette, compact centered composition, isolated transparent background, no mockup.

Use 1:1 or 5:6 canvas, defaulting to 5:6. Stay within 4500×5400 px; smaller generation is fine. Do not stretch or silently crop. Reuse the same master on compatible POD products.

Before returning, check the ratio, any lettering, silhouette, color contrast, background, and that the warm groovy signature is visible at thumbnail size. Do not claim legal clearance or marketplace readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
