---
name: pod-style-punk-xerox-zine
description: Create an original raw DIY POD graphic using photocopy contrast, rough halftone, and controlled zine collage.
---

# Punk Xerox and Zine Collage

Use for a deliberately rough photocopy or DIY zine appearance. Keep the focal idea clear despite the texture.

## Art direction

- Use stark black/cream contrast, rough halftone, a few cutout shapes, imperfect registration, and one dominant image or message.
- Keep the composition bounded without adding a fake rectangular sheet. Exact wording should be supplied by the user and may need separate typesetting.
- Use original symbols and copy. Avoid real band flyers, copied protest art, borrowed slogans, publisher marks, and texture that obscures the subject.

## Generation

For an image request, use built-in ImageGen to make exactly one POD master, not variants or garment mockups.

Prompt scaffold: Original DIY punk-zine T-shirt graphic about {subject}, high-contrast photocopy texture, rough but controlled halftone, a few torn-edge collage shapes, one clear focal image, limited black cream and {accent} inks, transparent outside area, no copied flyer or logo.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Do not stretch or silently crop. The single master is reused for compatible products.

Check that texture does not close letter counters or merge shapes, and that the message reads at thumbnail size. Do not claim legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
