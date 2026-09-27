---
name: pod-style-woodcut-linocut
description: Create a high-contrast carved-print POD illustration with directional cut marks and strong positive and negative shapes.
---

# Woodcut and Linocut

Use for graphic art that should resemble a hand-cut block print. Make the carved light channels and silhouette define the style.

## Art direction

- Use broad ink masses, carved negative-space channels, directional gouge marks, and slightly irregular print edges.
- Choose one main subject, one or two inks, and an optional simple oval, arch, or shield. Avoid gradient shading and dense hairline hatchwork.
- Keep clear open gaps between dark shapes so they remain separate on fabric.
- Do not add random digital grain over every area or imitate a named artist's signature composition.

## Generation

For an image request, use built-in ImageGen for a single master print, not mockups or variant batches.

Prompt scaffold: Original {subject} illustration as a hand-carved linocut or woodcut, strong silhouette, bold negative-space cuts, directional gouge marks, slightly irregular ink impression, one or two solid ink colors, transparent outside the artwork, no gradient.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. No stretching or silent crop; reuse one master across compatible POD products.

Check that the design works in monochrome, the cuts remain open when reduced, and the subject is immediately readable. Do not claim legal clearance or publication readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
