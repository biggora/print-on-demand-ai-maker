---
name: pod-style-bold-editorial-type
description: Create text-led POD designs with an exact supplied phrase, strong typographic hierarchy, or a funny slogan.
---

# Bold Editorial Type and Funny Slogan

Use when the user selects statement typography or asks for a text-first humorous design. Keep typography as the dominant visual language.

## Art direction

- Treat supplied wording as the artwork. Use one dominant word or short line with deliberate scale, spacing, and alignment; at most one supporting type character.
- Add only a small graphic accent if it clarifies the message. Use one or two high-contrast inks and compact, readable line breaks.
- Preserve spelling, punctuation, capitalization, and order exactly. Do not invent extra words, dates, fake labels, signatures, or logos.
- Image generators may distort letters. When exact lettering matters, create a clean text-free composition guide and typeset the final wording separately.

## Generation

For an image request, use built-in ImageGen for exactly one master design, not variants or a product mockup. Confirm ambiguous phrases before rendering.

Prompt scaffold: Text-led original T-shirt graphic with the exact wording {phrase}, bold editorial typography, clear hierarchy with {dominant word} largest, compact balanced line breaks, one or two ink colors, generous spacing, isolated transparent background. Render no other text.

Use 1:1 or 5:6 canvas, defaulting to 5:6, within 4500×5400 px. Never stretch or silently crop. Reuse the master on compatible products.

Compare every rendered character with the supplied phrase; check legibility at thumbnail size, ratio, contrast, accidental stray text, and background. Do not claim rights clearance or marketplace readiness.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
