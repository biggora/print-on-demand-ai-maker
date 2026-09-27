---
name: pod-style-fantasy-cottagecore
description: Create original cozy fantasy POD artwork with storybook nature, handcrafted forms, and one readable scene.
---

# Fantasy and Cottagecore Storybook

Use for gentle fantasy, forest folklore, cottagecore, or storybook nature. Create new creatures and settings.

## Art direction

- Pick one small enchanted scene or focal subject: a cottage, mushroom, fairy, dragon, garden, or woodland animal.
- Use handcrafted linework, warm muted colors, a compact storybook composition, and open spaces between foliage and buildings.
- A simple illustrated frame is optional; avoid turning it into a full rectangular page unless explicitly requested.
- Do not copy game/franchise creatures, named maps, spells, insignia, or recognizable costumes. Avoid dense tiny foliage.

## Generation

For an image request, use built-in ImageGen for one master artwork only, not mockups or batches.

Prompt scaffold: Original cozy fantasy storybook illustration of {subject or scene}, handcrafted linework, warm muted {palette}, simple enchanting focal composition, readable large forms and restrained foliage detail, isolated transparent background, no existing franchise symbols.

Use 1:1 or 5:6, defaulting to 5:6, within 4500×5400 px. No stretching or silent cropping. Reuse the same master across compatible products.

Check the focal scene at thumbnail size, originality, ratio, contrast, and detail density. Do not claim legal clearance or listing readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
