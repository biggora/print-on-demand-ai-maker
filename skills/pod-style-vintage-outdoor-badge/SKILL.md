---
name: pod-style-vintage-outdoor-badge
description: Create an original trail, camping, or nature POD badge with heritage park-poster character and fictional wording.
---

# Vintage Outdoor Heritage Badge

Use for outdoor, camping, travel, or nature themes arranged as a compact heritage-style badge.

## Art direction

- Place one simplified landscape or outdoor symbol in a badge/patch composition. Use sun-faded earth tones, sturdy outlines, and restrained in-art print wear.
- Keep trees, mountains, wildlife, and route markers to a few large shapes. Reserve a title area for user-provided wording or leave it blank.
- All parks, clubs, and trails must be fictional unless the user supplies authorized branding. Do not add real park seals, service marks, outdoor logos, or claims of certification.

## Generation

For an image request, use built-in ImageGen for one master print, not variants or product mockups.

Prompt scaffold: Original vintage outdoor badge about {outdoor subject}, simplified {landscape or symbol} in a compact patch composition, sun-faded {earth-tone palette}, sturdy shapes, light contained print wear, reserved title area for {exact supplied wording}, isolated transparent background, no real park or brand insignia.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Never stretch or crop silently. Reuse one master on compatible products.

Check fictional identity, contrast, title accuracy, ratio, and badge readability when reduced. Do not claim legal review is complete.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
