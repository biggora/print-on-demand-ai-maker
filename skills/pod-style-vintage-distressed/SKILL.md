---
name: pod-style-vintage-distressed
description: Create an original POD illustration with aged screen-print texture, faded ink, or a restrained heritage-era treatment.
---

# Vintage Distressed and Heritage

Use for an intentionally aged print look. Distress is a finish applied to a clear design, not a substitute for composition.

## Art direction

- Begin with a legible illustration or type layout, then add sparse cracked-ink gaps, uneven pigment, halftone wear, and sun-faded color.
- Use two to four inks and one dominant silhouette. Keep texture inside the artwork; do not create a fake shirt, paper sheet, or product mockup.
- Pick a decade or print process only when the brief supports it. Do not add band logos, album art, brands, or borrowed slogans.
- Keep distress away from fine letters and essential contours.

## Generation

For an image request, use built-in ImageGen for exactly one original master print. Ask only for missing subject, phrase, ratio, or base-shirt color where needed.

Prompt scaffold: Original heritage-inspired T-shirt print about {subject}, {decade cue if requested}, limited {palette} inks, subtle uneven screen-print wear and sparse cracked pigment within the shapes, strong readable silhouette, isolated transparent background, no garment mockup.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Smaller output may be upscaled later; never stretch or silently crop. Reuse the master on compatible products.

Check the clean silhouette first, then verify the wear looks deliberate and text remains readable at thumbnail size. Do not claim legal clearance or publication readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
