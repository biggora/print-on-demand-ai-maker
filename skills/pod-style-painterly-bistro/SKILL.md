---
name: pod-style-painterly-bistro
description: Create an original food-themed POD graphic with lively gouache or painted-menu illustration instead of photography.
---

# Painterly Bistro and Food Illustration

Use for a food or drink subject treated as an illustrated menu graphic, not a product photo.

## Art direction

- Feature one dish, ingredient, or small still life with broad gouache-like brush forms and imperfect pigment edges.
- Use a limited appetizing palette and the economy of a menu illustration. A label shape is optional; the outer canvas remains transparent.
- Keep supporting props few and purposeful. If words are requested, preserve exact copy or leave space for typesetting.
- Do not add restaurant logos, branded packaging, named chefs, photo realism, or unsupported ingredient/provenance claims.

## Generation

For an image request, use built-in ImageGen to create one master print, not multiple variants or a product mockup.

Prompt scaffold: Original gouache-style bistro illustration of {food or drink}, bold hand-painted brush shapes, lively but controlled {palette}, one clear focal dish with a few supporting details, compact menu-art composition, isolated transparent background, no restaurant branding or text.

Use a 1:1 or 5:6 canvas (default 5:6), within 4500×5400 px. Never stretch or silently crop. Reuse one master on compatible POD products.

Check food recognizability, brush texture, contrast, ratio, and accidental text before returning. Do not claim clearance or readiness to publish.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
