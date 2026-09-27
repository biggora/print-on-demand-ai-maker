---
name: pod-style-eldritch-cyber-horror
description: Create an original POD organic cyber-horror illustration with an uncanny machine-creature silhouette and readable slogan.
---

# Eldritch Cyber Horror

Use when this visual language is selected for a GitVane developer or AI slogan. Read the supplied theme and exact phrase; do not substitute a generic technology scene.

## Art direction

- Invent an unsettling machine-organism with an asymmetric silhouette, a few oversized eyes or cables and strong ink contrast.
- Use controlled ink hatching, coarse dots and restrained highlights; keep a limited palette and open gaps between appendages.
- Communicate hidden machine complexity without reproducing the familiar many-eyed creature with a yellow smiley mask, franchise monsters or a named artist composition.
- Keep supplied text in a separate readable zone. Avoid gore unless explicitly requested. This is an uncanny narrative subject treatment, not a symmetrical dark-romantic emblem.

## Generation and storage

For an image request, use built-in ImageGen for one master T-shirt print. User requests for multiple variants override this default. Do not generate a product mockup. Preserve the supplied phrase's spelling, punctuation, capitalization and word order. Omit lettering when no phrase was supplied. Any extra visible text must be approved.

Prompt scaffold: Original uncanny {machine-organism} T-shirt illustration, asymmetric organic cyber-horror silhouette, bold ink contours, controlled hatching, open gaps, limited inks, exact separate wording {phrase}, no smiley-mask meme or other text. Transparent outside the intended artwork; no garment, mockup, signature or logo. Omit phrase/label clauses when no text is requested.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Generate smaller if needed; upscale separately without stretching or silent cropping. Reuse the same master for compatible products.

See the registered generation workflow below before calling ImageGen or importing its result.

## Review

Uncanny silhouette reads when reduced, appendages remain separate, no copied meme or franchise creature.

Also check canvas ratio, garment contrast, clean edges and every rendered character against the supplied text. If lettering is inaccurate, mark it for revision or typeset the exact phrase separately; do not silently accept it. Use original subjects and graphic assets. Generation does not establish rights clearance, marketplace readiness or proven demand.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
