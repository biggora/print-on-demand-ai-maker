---
name: pod-style-digital-gloss-3d
description: Create one original POD design with controlled glossy or dimensional digital-object treatment and a simple printable silhouette.
---

# Digital Gloss and 3D

Use when a glossy, glass-like, or dimensional digital finish is requested. The image must still function as flat ink printed on fabric.

## Art direction

- Use one hero object, broad highlight bands, distinct value shapes, and a clean outline. Keep glow contained within the silhouette.
- Choose a compact palette and make overlaps clear. Surface treatment is secondary to recognizing the object.
- Do not create a product mockup, background scene, fake device interface, brand-shaped product, excessive bloom, or tiny photorealistic reflections.
- Do not claim the resulting print is physically metallic, raised, or reflective.

## Generation

For an image request, use built-in ImageGen to create exactly one master artwork, not variants or mockups.

Prompt scaffold: Original digital-gloss illustration of {subject}, one clear dimensional silhouette, broad glassy highlights and controlled color bands, restrained {palette}, clean edge suitable for flat garment printing, contained effects, isolated transparent background, no mockup or brand.

Use 1:1 or 5:6 (default 5:6), no larger than 4500×5400 px. Never stretch or silently crop. Reuse the same master across compatible items.

Check object recognition without glow, highlight separation, clean silhouette, ratio, and accidental background fill. Do not claim legal clearance or publication readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
