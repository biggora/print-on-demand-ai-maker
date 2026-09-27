---
name: vectorization
description: "Vectorize a raster image (PNG/JPG) into clean, scalable SVG for print: DTG/DTF masters, cut-ready decals, or screen-print color separations. Triggers on vectorize, trace, convert PNG/JPG to SVG, raster to vector, make this print scalable, I need an SVG of this design, reduce to N spot colors, color separations for screen printing, which tracer/engine is best (vtracer vs potrace vs imagetracer), compare engines, prepare artwork for a print shop or typography, clean up a PNG for Printful/Redbubble at large size, upscale a print to 4500x5400 or 4500x4500, export SVG to a print-size PNG. Also matches Russian phrasing: векторизовать, перевести/конвертировать в вектор, сделать SVG из картинки, растр в вектор, трассировка, цветоделение для трафаретной печати, подготовить макет для шелкографии или типографии, нужен вектор для печати, увеличить принт до печатного размера, экспорт в PNG 4500."
---

# Vectorization

Turn a raster print (usually an AI-generated PNG master) into an SVG that scales to any size without quality loss, or into per-color separations for screen printing. Use it on outputs from the `pod-style-*` skills, or on any image the user hands you directly.

## One-time setup

Before the first run, check whether dependencies are already installed:

```bash
ls skills/vectorization/scripts/node_modules 2>/dev/null || (cd skills/vectorization/scripts && npm install)
```

## The CLI

`node skills/vectorization/scripts/vectorize.mjs <command> ...` (run from the repo root, or `cd` into `scripts/` first).

```
node vectorize.mjs inspect <image>
node vectorize.mjs trace   <image> [-o out.svg] [--engine auto|vtracer|potrace|imagetracer]
                            [--preset low|medium|high|ultra] [--mode color|bw]
                            [--colors N] [--separate] [--threshold 0-255]
                            [--filter-speckle N] [--color-precision N] [--corner-threshold N]
node vectorize.mjs compare <image> [-d outdir] [--preset ...] [--mode ...] [--colors N]
node vectorize.mjs preview <svg-or-dir> [-o out.png] [--size 1024]
                            [--bg checker|white|black|#hex|transparent]
                            [--crop x,y,w,h] [--source <raster>]
node vectorize.mjs export  <svg> [-o out.png] [--ratio auto|1:1|5:6]
```

Every command prints exactly one JSON object to stdout (logs go to stderr) and exits 1 with `{"error": "..."}` on failure — parse stdout, don't scrape stderr.

- `inspect` reports `{width, height, hasAlpha, transparentPct, uniqueColors, uniqueColorsQuantized, isGrayscale, isTwoTone, dominantColors[{hex,pct}], suggestedEngine, suggestedMode, suggestedColors, notes[]}`.
- `trace` reports `{input, output, engine, preset, mode, colors, width, height, fills[{hex,paths}], fillCount, pathCount, bytes, ms, fidelity, supersample?}`. The SVG always carries a `viewBox`. `fidelity` is 1 minus the mean absolute pixel difference between a re-rasterized copy of the SVG and the source (0–1; ~0.97+ reads as visually faithful for flat art — photoreal art scores lower even when the trace is "correct"). `supersample: k` appears when potrace auto-upscaled a small source before tracing (see `references/engines.md`) — it's automatic, no flag needed, and file size stays small even though it's a bit larger than an un-supersampled trace.
- `compare` runs all three engines and writes `<name>.<engine>.svg` + `.png` previews plus a `<name>.contact.png` contact sheet; JSON gives `{results[{engine,output,preview,bytes,pathCount,fillCount,ms,fidelity,score,eligible,error?}], best, contactSheet}`. `score = fidelity − 0.01·log2(bytes / smallest successful bytes)`, so a result that only "wins" fidelity by tracing noise into a bloated file no longer wins; `best` is the highest-`score` result among `eligible: true` ones. A result gets `eligible: false` when it was traced from a downscaled copy (imagetracer above 4 MP input) and can never become `best`. `compare` also follows `inspect`'s `suggestedMode` when you don't pass `--mode` yourself, so a two-tone image gets potrace compared in `bw` mode automatically.
- `preview` rasterizes an SVG (or every SVG in a directory) for verification — this is how you look at a trace, don't write your own rendering script. A single SVG produces `<name>.preview.png` (longest side `--size`, default 1024) and reports `{previews:[{svg,png,width,height}], sheet?, note?}`; a directory renders every SVG in it plus a labeled `<dir>/_sheet.png`, which is exactly what you want for a `_separations/` folder. Default background is `checker` (shows both transparency and white ink — plain `white` would hide white ink). `--crop x,y,w,h` (fractions 0–1 of the canvas) renders that region as a true vector zoom into `<name>.crop.png`; add `--source <raster>` to get a labeled side-by-side of the original pixels (nearest-neighbor) against the vector zoom — the way to prove text or thin lines stayed crisp. Renders are fast, ~0.3s each.
- `export` renders an SVG natively at studio print size (not an upscaled bitmap — it re-renders the vector paths directly at the target resolution, so edges stay razor-sharp instead of picking up resample blur). Studio standards: `1:1` → 4500×4500, `5:6` → 4500×5400, both tagged with 300 DPI metadata (4500 px = 15 in). `--ratio auto` (the default) reads the SVG's own aspect ratio: within ±1% of a standard canvas it renders `fit: "exact"`; otherwise it picks the nearest canvas, scales the artwork to fit, and centers it on transparent padding (`fit: "padded"` plus a `note` — it never crops or stretches). Pass `--ratio` explicitly to force a canvas regardless of the source aspect. Reports `{input, output, ratio, width, height, sourceAspect, fit, dpi, bytes, ms, note?}`; default output `<name>.<W>x<H>.png`. ~1s.

## Workflow: inspect → choose → trace → verify

**1. Inspect first.** Run `inspect` before guessing engine/mode/colors — it already computes `suggestedEngine`, `suggestedMode`, `suggestedColors`, and flags like `isTwoTone` or a low `uniqueColorsQuantized`. Read `notes[]`, it calls out anything that changes the plan.

**2. Pick engine, mode, and colors, and explain why:**

- **Flat AI-generated art with a handful of intended colors** (`inspect` sets `suggestedColors`) — quantize with `--colors N`. Image generators anti-alias every edge, so a nominally 4-color design actually contains hundreds of near-duplicate shades along each edge; without `--colors` the tracer turns each shade into its own thin sliver path, which bloats the file and shows up as visible halos/fringes when printed. `--colors` snaps the raster to N flat colors before tracing, and applies again afterward — every engine's output fills get snapped to those same N colors, so the SVG has at most N fills no matter which engine ran. The side effect: any soft shadow, glow, or semi-transparent edge in the source becomes a hard color boundary. That's correct for screen print (ink has no soft gradients), but it's a visible change to the art, so tell the user rather than letting it pass silently. See `references/engines.md` for the full mechanics.
- **Art with real shading/gradients where `inspect` reports `suggestedColors: null`** — don't force `--colors`; quantizing genuinely shaded art posterizes it for no reason. Trace with plain vtracer (medium/high) and let it keep its natural color count.
- **B&W line art, logos, text, technical drawings** — `--engine potrace --mode bw`. Potrace finds the globally optimal trace path for a two-tone image and produces the smallest files with the cleanest edges. Note the license: `potrace` is GPL-2.0 — flag that to the user if the project's licensing stance matters for shipped assets.
- **Gradients or photo-like art** — `--engine vtracer --preset high` (or `ultra`). Warn the user up front: vectorizing photoreal art produces large SVGs and a posterized look, because a tracer can only approximate continuous tone with flat filled regions. If the source isn't meant to look "flat," vectorization may be the wrong tool entirely — say so instead of tracing anyway.
- Unsure, or want to sanity-check the pick — run `compare` and look at the contact sheet.

See `references/engines.md` for the full decision tree, per-engine parameter table (what each preset actually sets), and size/performance expectations — read it before tuning individual flags like `--filter-speckle` or `--corner-threshold` by hand.

**3. Trace**, then **4. verify** — never accept a trace on the JSON numbers alone:

- Check `fidelity` (low means something is off — see troubleshooting), `fillCount` (far more fills than intended colors means fringe/speckle noise got through), and `bytes` (an unexpectedly huge file usually means too many paths).
- Never trust the numbers blind — always look at the result. After every `trace`, run `node vectorize.mjs preview out.svg` and Read the resulting PNG before reporting anything. For B&W or text-heavy art, also zoom the smallest text with `--crop x,y,w,h --source <original-raster>` to confirm it stayed crisp rather than blurring or dropping strokes. For `--separate` output, run `preview` on the `_separations/` directory and Read the `_sheet.png` to check every ink layer at once. Don't write your own rasterization script or drop helper files into `scripts/` — `preview` already covers rendering, cropping, and side-by-side comparison; reaching for a custom script here just costs time and clutters the skill's directory.
- If fidelity is low or the file is bloated, iterate: adjust `--preset`, add/tighten `--colors`, or raise `--filter-speckle` — then re-check with `preview`. Don't hand back a first attempt that looks wrong.
- Large masters take a while: expect roughly 10–30 s per `trace` on images above ~20 megapixels, and longer for `compare` (imagetracer auto-downscales to ≤4 MP inside `compare`, so its result there won't match a standalone `trace` at full resolution).

## Scenario recipes

**1. Scalable print master (DTG/DTF, 4500×5400)** — DTG/DTF print unlimited colors, so don't force `--colors` unless the source is genuinely flat. Follow `inspect`'s `suggestedColors`:
```bash
node vectorize.mjs inspect design.png
# suggestedColors: null (shaded/gradient art) → trace as-is, keep full color range
node vectorize.mjs trace design.png --engine vtracer --preset medium -o design.svg
# suggestedColors: 6 (genuinely flat art) → quantize to match
node vectorize.mjs trace design.png --engine vtracer --preset high --colors 6 -o design.svg
```
Example from real usage: a 5500×5500 shaded AI illustration (`suggestedColors: null`) traced with plain vtracer medium, no `--colors`, came back at fidelity 0.99, ~4200 fills, ~11 s — quantizing that same image would have posterized detail the source actually has.

**2. Screen printing — limit to N spot colors + separations:**
```bash
node vectorize.mjs trace design.png --engine vtracer --colors 4 --separate -o design.svg
node vectorize.mjs preview design_separations/
```
`trace --separate` produces `design.svg` plus one SVG per ink color in `design_separations/NN_<hex>.svg` (cutout mode — no overlapping ink layers). A transparent background is not an ink and stays transparent, but white or near-white *inside* the design is a real ink (it prints as white ink on dark garments) — list it in the palette, don't drop it as if it were background. `preview` on the separations directory writes a labeled `design_separations/_sheet.png`; Read it to verify every ink layer before reporting. Present the result as a table, not just raw JSON:

| Hex | Coverage % | Separation file |
|---|---|---|
| #1a1a1a | 42% | `01_1a1a1a.svg` |
| #ffffff | 18% | `02_ffffff.svg` |
| ... | ... | ... |

The palette is now built from flat (non-edge) pixels and refined with k-means, so anti-aliased edge colors don't steal ink slots and the script already avoids near-duplicate entries — but still sanity-check the result: if two rows in the table look like the same ink to the eye, tell the user and suggest either lowering `N` or treating them as one color.

**3. Not sure which engine, want a visual check:**
```bash
node vectorize.mjs compare design.png -d out/
```
`best` is a sensible default (it already balances fidelity against bloat), not gospel — Read the `contactSheet` PNG and eyeball it yourself before committing, then re-run `trace` with that engine's settings if you need a clean single output (not just the comparison artifacts). Need a closer look at one candidate first? `node vectorize.mjs preview out/design.vtracer.svg --crop 0.2,0.2,0.3,0.3 --source design.png` gives a labeled pixels-vs-vector zoom.

**4. Upscale a small print to print size (raster → vector → print PNG):**
```bash
node vectorize.mjs inspect small.png
node vectorize.mjs trace small.png --engine vtracer --preset high --colors 16 -o small.svg
node vectorize.mjs preview small.svg --crop 0.4,0.4,0.2,0.2 --source small.png   # zoom the smallest text
node vectorize.mjs preview small.svg --crop 0.1,0.6,0.3,0.3 --source small.png   # and a shaded area
node vectorize.mjs export small.svg --ratio 5:6 -o print.png
```
This beats plain pixel resampling: stretching a 1000 px source to 4500 px interpolates and blurs every edge, while `export` re-renders the vector at the target size instead. If the art has text or other hard-edged shapes, trace with `--colors` (start at 16; adjust 12–24 for the art's real color count) and `--preset high` even when `inspect`'s `suggestedColors` is null — measured on a bold-text + shaded-tiger print, un-quantized tracing distorted letterforms (wavy strokes, a notched D, from anti-aliased fringe pixels around small text becoming slivers the tracer smooths into wobbles) even at `ultra`, and pre-upscaling the raster before tracing only helped a little while adding color halos and bloating files to 11–19 MB; `--colors 16 --preset high` gave clean straight letters with no halos at 1.4 MB. The trade-off is real: quantizing mildly posterizes shaded areas, so zoom both the text and a shaded region and tell the user which they're trading for which. If the art is mostly painterly with no text or hard edges, say a vector upscale may not be the right tool — a good resample could beat it. If `export` reports `fit: "padded"`, the source wasn't 1:1/5:6 — ask the user which studio canvas they want rather than silently picking one.

## POD registration

A vectorized SVG is a **derived file** of an existing generation attempt, not a new generation. After tracing, register it with:

```bash
pod import-image <slug> --file <svg-path> --parent-attempt <source-attempt-id> --prompt "vectorize: vtracer preset=high colors=6"
```

Use a `--prompt` that accurately describes the vectorization settings actually used (engine, preset, colors/mode), not a creative prompt. Files stay in `POD_ASSETS_DIR` (absolute, outside Git) — never commit generated or vectorized images to Git. If `pod import-image` rejects an SVG file, stop and report that to the user rather than silently converting it to another format or working around the rejection.

An `export`ed PNG is a derived file too, same rule as the SVG — register it separately with its own accurate prompt, e.g. `pod import-image <slug> --file print.png --parent-attempt <source-attempt-id> --prompt "vectorize+export: vtracer preset=medium → 4500x5400"`.

If the source image did not come from the `pod` workflow (a user-supplied file), skip registration — just write the SVG next to the source or to whatever path the user asked for.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Huge SVG / very high `pathCount` | Speckle noise, or too many colors from anti-aliasing | Raise `--filter-speckle`, lower `--preset`, or add/tighten `--colors` |
| Jagged or blocky edges | Preset too low for the detail in the source | Raise `--preset` (medium → high → ultra) |
| Way more distinct fills than the design should have | Anti-alias fringe colors weren't quantized away | Add `--colors N` matching the intended palette |
| Thin lines or serifs disappear | Potrace threshold/detail too aggressive | Raise `--preset` to `high`, or adjust `--threshold`; `ultra` rarely adds visible benefit over `high` for B&W art and just costs file size |
| Flat white/solid box behind the design | Source had no alpha channel and a color engine (vtracer/imagetracer) traced the background as a real fill. potrace `bw` traces only the ink, so its background is transparent even from a JPG | Confirm on the result before telling the user anything: look for a near-white entry in `fills` and at a `preview` on the default checker background. Only if the box is really there: remove that fill from the SVG or remove the background before tracing |
| Low `fidelity` on art that should trace cleanly | Wrong engine/mode for the content (e.g. vtracer on B&W line art, or color mode on a two-tone image) | Re-check `inspect`'s `suggestedEngine`/`suggestedMode`, or run `compare` |

## What to report back

For every trace, tell the user: engine, preset/mode/colors used, output path(s) (including separation files if `--separate` was used), `fillCount`, `bytes`, `fidelity`, and show or reference a preview image. Call out any caveats plainly — potrace's GPL-2.0 license, a background-fill issue, a low fidelity score, or that the source really wasn't suited to vectorization. Also save the raw JSON stdout of the final `trace`/`compare` call next to the outputs (e.g. `<name>.trace.json`) — cheap to do and useful later if the settings need auditing.
