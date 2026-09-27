# Engine Reference

Read this when `inspect`'s suggestion seems off, when you need to hand-tune a flag beyond `--preset`, or when explaining a trade-off to the user in detail. For the everyday workflow, see `../SKILL.md`.

## Decision tree

```
What's in the image?
│
├── Photo, complex artwork, gradients, high-res scan, pixel art
│   └── vtracer, --preset high or ultra
│
├── B&W logo / line art / text / technical drawing / silhouette / stamp
│   └── potrace, --mode bw, --preset high (ultra rarely adds visible benefit, just costs size)
│
├── Colorful flat illustration, cartoon, icon, simple graphic
│   └── vtracer (fastest, best general default) or imagetracer (palette-based alternative)
│
└── Not sure, or it matters enough to check
    └── compare (runs all three, writes previews + contact sheet, reports `best` by score — fidelity weighed against file bloat)
```

`vtracer` is the default general-purpose choice: fastest, full color, most compact output, handles nearly everything except pure B&W line art (where potrace wins) and very large flat-palette illustrations where imagetracer's palette approach can look cleaner but slower.

## Per-engine parameters

### VTracer (`@neplex/vectorizer`)

Full color, K-means color clustering, O(n) — fastest of the three, most compact output for complex art. `--colors N` (this skill's flag) quantizes the raster before handing it to vtracer, and after tracing every fill is snapped to those N palette colors too (see "`--colors` applies to every engine" below). `--color-precision`, `--filter-speckle`, `--corner-threshold` map to vtracer's own config and override the preset default when passed.

| Preset | filterSpeckle | colorPrecision | layerDifference | cornerThreshold | lengthThreshold | maxIterations | spliceThreshold | pathPrecision |
|---|---|---|---|---|---|---|---|---|
| low | 8 | 4 | 32 | 60 | 4 | 2 | 45 | 2 |
| medium | 4 | 6 | 16 | 60 | 4 | 4 | 45 | 4 |
| high | 2 | 8 | 8 | 60 | 4 | 8 | 45 | 6 |
| ultra | 1 | 8 | 4 | 60 | 4 | 10 | 45 | 8 |

- `filterSpeckle` — minimum region size kept; higher = more noise removed but small details can vanish.
- `colorPrecision` — number of color clusters (bit depth); higher = more distinct color layers.
- `layerDifference` — minimum color distance between layers; lower = more layers survive (more colors), higher = similar shades merge.
- `cornerThreshold` — angle (degrees) above which a point is treated as a corner rather than smoothed.
- `maxIterations` — K-means refinement passes; higher = better color separation, slower.
- `pathPrecision` — decimal precision of path coordinates; higher = larger file, marginally smoother curves.
- `--separate` runs vtracer in Cutout hierarchical mode (regions don't overlap/knock out each other) instead of the default Stacked mode, and splits the result into one SVG per fill color — this is what makes it usable for screen-print separations.

### Potrace (`potrace` npm package, GPL-2.0)

B&W only by design; `color` mode is pseudo-color via repeated posterize passes, not true color tracing. Globally optimal trace path — smallest files, best fidelity for two-tone content.

| Preset | turdSize | alphaMax | optTolerance | posterize steps (color mode only) |
|---|---|---|---|---|
| low | 4 | 1.5 | 0.5 | 2 |
| medium | 2 | 1.0 | 0.2 | 3 |
| high | 1 | 0.8 | 0.1 | 4 |
| ultra | 0 | 0.5 | 0.05 | 6 |

- `turdSize` — suppresses speckles up to this pixel size; lower = keeps finer detail (and more noise).
- `alphaMax` — corner-detection threshold; lower = sharper corners preserved, higher = smoother/rounder curves.
- `optTolerance` — Bézier curve-fit tolerance; lower = tighter fit to the original bitmap, larger file.
- `--threshold` (0–255, this skill's flag) sets the B&W cutoff directly and overrides the automatic threshold.
- `posterize steps` only applies when `--mode color` is used with potrace — it layers this many B&W threshold passes to fake color; more steps = more pseudo-color detail but can look brighter than the source (a known posterize rendering artifact).
- Output path rounding is scale-aware, not a flat whole-pixel snap: at export print size (4500 px) it's effectively sub-pixel, so file size stays small without a visible change at print scale. `high` is enough detail for essentially all B&W logos, text, and line art — reach for `ultra` only for very fine technical drawings, since it rarely improves the visible result over `high` and costs file size.
- Small sources are automatically supersampled before tracing: when the source's longer side is under 2000 px, potrace traces a Lanczos-upscaled copy at `k = min(4, ceil(3600 / maxDim))`. Tracing tiny letters at native resolution rounded their corners and bloated shapes (a "S" turning blobby, for example) — a defect that only became obvious once `export` blew the result up to 4500 px. Supersampling fixed it (text-shape IoU 0.955 → 0.987 in testing) at essentially no cost to the agent: the reported `width`/`height` stay at source size, only `viewBox` reflects the supersampled space, and `trace`/`compare` JSON add a `supersample: k` field so you can see it happened. This is automatic — no flag to set. It does mean small-source B&W SVGs run ~40–70 KB instead of ~15–20 KB; that's still tiny, don't "fix" it by turning supersampling off or down.

### ImageTracerJS (pure JS, no native deps)

Palette-based: quantizes to a limited color palette, then traces each color like running potrace once per color. Slower than vtracer (roughly 4–5x on the same image) and struggles with photographic content, but reasonable for flat palette-based illustrations without native dependencies.

| This skill's preset | imagetracerjs preset name | Behavior |
|---|---|---|
| low | `posterized1` | Simple, few colors |
| medium | `default` | General purpose |
| high | `detailed` | Maximum detail retention |
| ultra | `artistic1` | Artistic interpretation, maximum fidelity to source |

ImageTracerJS ignores `--filter-speckle`, `--color-precision`, and `--corner-threshold` (no equivalent knobs) — its detail level is controlled entirely by the preset name above. `--colors` still applies to it, same as every other engine (see below).

## `--colors` applies to every engine, after tracing too

`--colors N` isn't just a pre-trace quantization step. Every engine's output fills are also snapped to those same N palette colors post-trace, and alpha is made binary (fully opaque if ≥128, otherwise fully transparent). The practical effect: with `--colors N` set, the traced SVG has **at most N fills**, regardless of which engine produced it. This is a deliberate simplification for print, but it has a visible consequence worth telling the user about — any soft shadow, glow, or semi-transparent edge in the source gets flattened to a hard-edged color boundary. That's exactly right for screen printing (ink doesn't do soft gradients either), but it's a real change to the artwork, not just a file-size optimization, so call it out rather than silently accepting the trace.

## Use-case table

| Use case | Engine | Preset |
|---|---|---|
| Scalable print master, flat AI art | vtracer | high (ultra for archival) |
| Company logo, wordmark | potrace | high |
| App icon / simple flat icon | imagetracer or vtracer | medium |
| Technical diagram / line art | potrace | high (ultra only for very fine detail) |
| Screen-print separations | vtracer with `--separate` | medium–high |
| Artistic/photoreal print (expect large, posterized output) | vtracer | ultra |
| Batch previews / thumbnails | vtracer | low |
| Cartoon character, colorful illustration | imagetracer | high |

## Performance and size expectations

| Engine | ~100 KB PNG | ~1 MB PNG | ~5 MB PNG |
|---|---|---|---|
| vtracer | <100 ms | ~500 ms | ~2 s |
| potrace | <50 ms | ~200 ms | ~1 s |
| imagetracer | ~200 ms | ~2 s | ~10 s+ |

| Engine | Simple logo | Illustration | Photo |
|---|---|---|---|
| vtracer | 5–20 KB | 50–200 KB | 100–500 KB |
| potrace | 2–10 KB | N/A (B&W only) | N/A |
| imagetracer | 10–50 KB | 100–500 KB | 500 KB–2 MB |

Actual numbers vary with image complexity and chosen preset — treat this table as a sanity check, not a guarantee. If a trace comes back far outside these ranges, that's a signal to look at `fillCount`/`pathCount` and reconsider preset or `--colors`.
