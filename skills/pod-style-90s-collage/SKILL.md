---
name: pod-style-90s-collage
description: Create an original 1990s-inspired layered graphic collage for POD using invented or authorized subjects only.
---

# 90s Graphic Collage

Use for a layered, analog 1990s-inspired poster composition. The visual reference is collage grammar, not a real band or celebrity design.

## Art direction

- Use one dominant paper cutout and up to two supporting crops. Show visible cut edges, overlaps, and small print-registration shifts; apply direct-flash lighting, selective halftone, analog grain, and one controlled gradient.
- Build a clear poster hierarchy from distinct flat layers inside a bounded composition. Leave type areas clean when exact lettering will be typeset later.
- Use invented characters, authorized supplied portraits, or objects. Do not imitate a specific band's shirt, album cover, celebrity, sports logo, or branded lettering.
- Avoid fake names/captions, unrelated fragments, seamless 3D scenes, glossy rendered objects, and photoreal depth. The result should read as assembled printed pieces at thumbnail size.

## Generation

For an image request, use built-in ImageGen to make exactly one master, not a batch or mockup. Ask about image rights only if the brief depends on a supplied real person's portrait.

Prompt scaffold: Original 1990s analog cut-paper collage about {subject}; one large flat original or authorized subject cutout and up to two smaller cropped pieces, visibly separate paper edges and overlaps, selective direct-flash highlights and halftone grain, readable poster hierarchy, saturated {palette}, isolated transparent print artwork; no seamless 3D scene, real people, logos, or extra text.

Use 1:1 or 5:6 canvas (default 5:6), max 4500×5400 px. Do not stretch or silently crop; reuse one master across compatible products.

Inspect originality, hierarchy, stray text, ratio, silhouette, and small-size legibility. Do not imply that the design has been legally cleared.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
