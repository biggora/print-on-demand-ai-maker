---
name: pod-style-y2k-chrome-pop
description: Create an original early-2000s digital-pop POD graphic with controlled chrome highlights and playful futuristic forms.
---

# Y2K Chrome Pop

Use when Y2K digital nostalgia is the requested visual style. Keep chrome as a printed color illusion.

## Art direction

- Use a rounded futuristic hero shape, a few stars or orbital marks, glossy gradients, and controlled silver highlights with electric cyan, hot pink, or black accents.
- Choose one object or short supplied phrase. Keep a compact hierarchy and crisp edges; the main silhouette should read without screen glow.
- Avoid copied technology logos, branded interface icons, cluttered UI panels, and uncontrolled thin glows.

## Generation

For an image request, use built-in ImageGen to create exactly one master print, not variants or a product mockup. Preserve exact user wording; omit lettering if none was requested.

Prompt scaffold: Original Y2K chrome-pop T-shirt graphic about {subject}, rounded futuristic silhouette, controlled metallic highlight bands, electric cyan silver and hot-pink accents, a few simple orbital or star shapes, crisp printable edges, isolated transparent background, no logo or UI.

Use 1:1 or 5:6 canvas, defaulting to 5:6, within 4500×5400 px. Smaller generation is acceptable. Never stretch or silently crop; reuse this master on compatible products.

Check the silhouette without glow, accidental text, color separation, ratio, and edge clarity at thumbnail size. Do not claim rights clearance or marketplace readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
