---
name: pod-style-varsity-social-club
description: Create a fictional club or sports-inspired POD emblem with adaptable lettering and no real institution or team branding.
---

# Varsity and Social Club Badge

Use for club, hobby, school-spirit-like, or sports badge compositions. The organization must be fictional or explicitly user-owned.

## Art direction

- Build an arched title area, one central hobby/sport symbol, and an optional small supporting line. Use bold collegiate letters for varsity or calm serif lettering for a social-club look.
- Limit the palette to two or three inks. Keep central symbol and lettering balanced so the badge works for different fictional club names.
- Do not invent years, credentials, institutional claims, or organizations. Leave text blank if exact copy will be typeset separately.
- Never copy real school crests, mascots, team marks, league logos, or trademarked slogans.

## Generation

For an image request, use built-in ImageGen for one master print, not mockups or batches. Preserve exact supplied wording.

Prompt scaffold: Original fictional {hobby or sport} club badge, bold varsity or social-club layout, arched title area reserved for {exact supplied name}, one central {symbol}, two or three solid inks, clean balanced outlines, isolated transparent background, no real institution or team identity.

Use 1:1 or 5:6, default 5:6, within 4500×5400 px. Do not stretch or silently crop. Reuse one master on compatible products.

Check that the badge is visibly fictional, the symbol reads at small size, and any text is exact and legible. Do not claim legal clearance.

## Registered generation workflow

Resolve `POD_ASSETS_DIR` before any studio mutation; it must be an absolute folder outside Git. Create or select a work record and write the complete exact ImageGen prompt to a UTF-8 file in that folder. Before calling ImageGen, run `pod job prepare <slug> --prompt-file <path> --provider builtin --variant <composition-name> --ratio 5:6` (use `--ratio 1:1` for square artwork), then `pod job start <job-id>` from `producer-pod/`. Use the saved prompt from that job verbatim. If start returns a completed result, reuse it without generating; if it reports running/unknown/failed, stop and resolve the attempt rather than call ImageGen again.

After generation, import the returned local image using `pod import-image <slug> --file <image-path> --attempt <attempt-id>`. This stores the image and exact `.prompt.txt` sidecar in `POD_ASSETS_DIR` and links the work history to the attempt. Do not supply a changed prompt on import. For a deliberate regeneration, use `pod job retry <job-id> --reason <reason>` before starting; for a changed prompt/composition prepare a new job. For multiple requested variants prepare one job per complete composition prompt and optionally group job IDs with `pod batch create`. Import an edit/upscale as a derived file with `--parent-attempt <source-attempt-id>` and an accurate `--prompt`; do not count it as a new generation. Never put generated images in Git.
