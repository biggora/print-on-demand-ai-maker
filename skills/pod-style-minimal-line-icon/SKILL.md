---
name: pod-style-minimal-line-icon
description: Create a minimal POD design using one distinctive contour, icon, or quiet retro-minimal symbol with negative space.
---

# Minimal Line and Icon

Use for sparse line art, a compact emblem, or retro-minimal iconography. Make reduction and legibility the main design constraints.

## Art direction

- Reduce the subject to one recognizable silhouette, economical contour, and one or two inks. Use negative space deliberately.
- Decide whether the brief calls for a small emblem or larger central mark. Keep stroke weight consistent and thick enough for fabric printing.
- Muted vintage colors may be used when requested. Do not add decorative frames, stars, shadows, or micro-labels by default.
- Avoid hairline strokes, indistinct intersections, and unnecessary gradients.

## Generation

For an image request, use built-in ImageGen to create one master print, never variants or a product mockup. Ask only for missing subject, phrase, ratio, or shirt color.

Prompt scaffold: Minimal original {subject} icon for a T-shirt, economical clean contour, one recognizable silhouette, balanced negative space, consistent print-safe strokes, {one or two inks}, no gradients or fine shading, isolated transparent background.

Use 1:1 or 5:6 (default 5:6), within 4500×5400 px. Never stretch or silently crop. Reuse the master on compatible products.

Check recognition at thumbnail size, continuous strokes, contrast against the intended garment, canvas ratio, and absence of stray marks. Do not claim marketplace clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
