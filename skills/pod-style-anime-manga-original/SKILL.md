---
name: pod-style-anime-manga-original
description: Create an original anime- or manga-inspired POD illustration with a new character, setting, and visual identity.
---

# Anime and Manga — Original Characters

Use for broad anime/manga visual language only. The character, costume, props, and setting must be original or explicitly authorized.

## Art direction

- Use clean expressive contours, a clear dynamic pose, cel-shaded color blocks, and optional restrained screentone.
- Focus on one character or creature and one readable action. Specify emotion and silhouette before adding details.
- Treat the genre as a visual vocabulary; do not reference a franchise, artist, recognizable uniform, signature emblem, or famous panel composition.
- Keep screened texture sparse so it survives reduction.

## Generation

For an image request, use built-in ImageGen to make one master print, not a batch or a product mockup.

Prompt scaffold: Original anime-manga-inspired illustration of a new {character or creature} doing {action}, expressive clean ink contours, dynamic readable pose, controlled cel-shading and sparse screentone, original costume and symbols, isolated transparent T-shirt graphic, no existing franchise or artist reference.

Use a 1:1 or 5:6 canvas, default 5:6, within 4500×5400 px. Never stretch or silently crop; reuse one master on compatible products.

Check originality, pose/anatomy artifacts, contour clarity, accidental lettering, ratio, and print-scale detail. Do not state that genre popularity grants rights.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
