---
name: pod-style-retro-cartoon-mascot
description: Create an original expressive cartoon mascot for POD using broad vintage animation traits, without copying existing characters.
---

# Retro Cartoon Mascot

Use for an original anthropomorphic object or animal with a clear gesture. Broad early-animation traits are allowed; copying a character or studio design is not.

## Art direction

- Choose one hero, one action, and a specific emotion. Use flexible simple limbs, a bold ink outline, readable eyes, and two to four flat colors.
- A rubber-hose variant may use flexible limbs, but the face, costume, proportions, and silhouette must be original.
- Limit accessories to one or two large shapes. The action should be understood without a caption.
- Avoid known cartoon characters, studio mascots, iconic gloves/costumes, and cluttered tiny props.

## Generation

For an image request, use built-in ImageGen to generate exactly one master design, not a set of variants or a product mockup.

Prompt scaffold: Original retro cartoon mascot of {subject}, {clear action} with a {specific emotion}, flexible simple limbs, bold ink outline, flat two-to-four-color palette, clean readable pose, isolated transparent background, no existing character or studio reference.

Use 1:1 or 5:6 canvas (default 5:6), up to 4500×5400 px. Never stretch or silently crop; reuse this master across compatible POD products.

Check action and emotion from the silhouette, anatomy artifacts, palette separation, ratio, and originality before returning. Do not claim rights clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
