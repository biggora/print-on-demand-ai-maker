---
name: pod-style-geometric-abstract
description: Create an original geometric or abstract POD graphic with a deliberate shape system, visual rhythm, and limited palette.
---

# Geometric and Abstract

Use for geometric, color-block, optical, or liquid-abstract work. Choose one consistent formal system.

## Art direction

- Select one mode: large color blocks, optical stripes, circles, diagonals, or liquid geometry. Use a clear center or deliberate repeat rhythm.
- Limit the palette and preserve negative space so the shapes do not collapse into visual noise.
- Default to one bounded chest-print composition. Use a full-bleed repeat only when the user asks for a pattern.
- Avoid random mixing of systems, pseudo-text, fragile hairlines, and gradients that rely on subtle screen glow.

## Generation

For an image request, use built-in ImageGen to make exactly one master print, not variants or mockups.

Prompt scaffold: Original geometric abstract T-shirt graphic about {concept}, based on {one clear shape system}, deliberate {symmetry or optical rhythm}, bold separated forms, limited {palette}, balanced negative space, crisp print-friendly edges, isolated transparent background.

Use a 1:1 or 5:6 canvas, default 5:6, within 4500×5400 px. Do not stretch or crop silently. Reuse one master for compatible products.

Check visual rhythm at a glance, shape separation, ratio, and that the file contains only intended artwork. Do not claim marketplace readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
