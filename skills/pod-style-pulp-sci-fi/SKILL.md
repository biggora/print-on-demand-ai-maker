---
name: pod-style-pulp-sci-fi
description: Create an original retro science-fiction POD poster composition with a dramatic machine or robot and a satirical slogan.
---

# Pulp Sci-Fi Poster

Use when this visual language is selected for a GitVane developer or AI slogan. Read the supplied theme and exact phrase; do not substitute a generic technology scene.

## Art direction

- Use one original machine, robot or impossible scientific apparatus with a theatrical silhouette, rays or a simplified cosmic setting.
- Use cream, orange and dark blue or another restrained vintage palette, broad shading and coarse halftone. Keep the supplied short headline above or below the scene.
- The style is dramatic retro-future storytelling, not an outdoor badge or chrome Y2K object. Do not reproduce a magazine cover, film poster, franchise robot or artist composition.

## Generation and storage

For an image request, use built-in ImageGen for one master T-shirt print. User requests for multiple variants override this default. Do not generate a product mockup. Preserve the supplied phrase's spelling, punctuation, capitalization and word order. Omit lettering when no phrase was supplied. Any extra visible text must be approved.

Prompt scaffold: Original retro science-fiction T-shirt poster of {subject}, dramatic pulp illustration, theatrical rays, limited vintage ink palette, bold silhouette, exact headline {phrase}, no publisher marks or other text. Transparent outside the intended artwork; no garment, mockup, signature or logo. Omit phrase/label clauses when no text is requested.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Generate smaller if needed; upscale separately without stretching or silent cropping. Reuse the same master for compatible products.

See the registered generation workflow below before calling ImageGen or importing its result.

## Review

Retro-future story and silhouette read immediately; no copied cover or franchise elements.

Also check canvas ratio, garment contrast, clean edges and every rendered character against the supplied text. If lettering is inaccurate, mark it for revision or typeset the exact phrase separately; do not silently accept it. Use original subjects and graphic assets. Generation does not establish rights clearance, marketplace readiness or proven demand.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
