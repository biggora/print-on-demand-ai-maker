---
name: pod-style-naive-doodle-kawaii
description: Create playful hand-drawn POD artwork with a simple cute character, controlled imperfect contours, and sparse decoration.
---

# Naive Doodle and Kawaii

Use when the brief calls for cute doodles, intentionally naïve linework, or a playful hand-drawn character. Do not imitate a named illustrator.

## Art direction

- Use one character or a few related doodles, an expressive face, one clear gesture or joke, and slightly wobbly but controlled lines.
- Use a compact pastel or two-ink palette. Imperfection should look authored, not like random scribbling; cuteness should not require clutter.
- Hearts, stars, and accents are optional and should clarify the mood, not fill empty space.
- Avoid glossy 3D rendering, existing mascots, noisy sketch texture, and tiny details carrying the whole joke.

## Generation

For an image request, use built-in ImageGen for exactly one master print, not variants or a product mockup. Ask about subject or ratio only if not inferable.

Prompt scaffold: Original cute naive doodle of {subject doing action}, deliberately imperfect but controlled hand-drawn contours, simple expressive face, playful pose, sparse pastel or two-ink palette, a few purposeful accents, isolated transparent background, no lettering unless requested.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Do not stretch or silently crop. Reuse one master on compatible products.

Check that the character is readable small, line quality is consistent, text is absent unless requested, and contrast works on the garment. Do not imply legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
