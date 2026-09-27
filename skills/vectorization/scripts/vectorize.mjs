#!/usr/bin/env node
// Raster -> SVG vectorization CLI. Licenses: VTracer/@neplex/vectorizer (MIT),
// ImageTracerJS (Unlicense), node-potrace (GPL-2.0).
import { parseArgs } from 'node:util';
import { mkdir, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import potrace from 'potrace';
import ImageTracer from 'imagetracerjs';
import {
  vectorize as vtVectorize,
  ColorMode as VTColorMode,
  Hierarchical,
  PathSimplifyMode,
} from '@neplex/vectorizer';

// ---------- small utils ----------

function log(...args) {
  console.error(...args);
}

function printResult(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function fail(message) {
  printResult({ error: message });
  process.exitCode = 1;
}

function hex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistance(hexA, hexB) {
  const [ra, ga, ba] = hexToRgb(hexA);
  const [rb, gb, bb] = hexToRgb(hexB);
  return Math.sqrt((ra - rb) ** 2 + (ga - gb) ** 2 + (ba - bb) ** 2);
}

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function defaultSvgOutput(input) {
  const ext = path.extname(input);
  return input.slice(0, -ext.length || undefined) + '.svg';
}

function defaultCompareDir(input) {
  const dir = path.dirname(input);
  const base = path.basename(input, path.extname(input));
  return path.join(dir, `${base}_compare`);
}

// ---------- image inspection ----------

async function inspectImage(input) {
  const img = sharp(input);
  const meta = await img.metadata();
  const { width, height } = meta;
  const hasAlpha = !!meta.hasAlpha;

  const { data: raw, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = info.width * info.height;
  let transparentCount = 0;
  let grayCount = 0;
  const exactColors = new Set();

  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2], a = raw[i + 3];
    if (a < 8) {
      transparentCount++;
      continue;
    }
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff <= 12) grayCount++;
    if (exactColors.size <= 5000) exactColors.add((r << 16) | (g << 8) | b);
  }

  const opaquePixels = totalPixels - transparentCount;
  const transparentPct = Math.round((transparentCount / totalPixels) * 10000) / 100;
  // Tolerant grayscale check: real photos/scans/JPEGs carry a little chroma
  // noise even in "black ink on white" art, so require the vast majority of
  // opaque pixels to be near-neutral rather than every single one.
  const grayscale = opaquePixels > 0 && grayCount / opaquePixels >= 0.98;

  // quantize to 32 colors for dominant-color / flat-art detection
  const quantBuf = await sharp(input)
    .ensureAlpha()
    .png({ palette: true, colors: 32, dither: 0 })
    .toBuffer();
  const { data: qRaw, info: qInfo } = await sharp(quantBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const counts = new Map();
  let qOpaque = 0;
  for (let i = 0; i < qRaw.length; i += 4) {
    const r = qRaw[i], g = qRaw[i + 1], b = qRaw[i + 2], a = qRaw[i + 3];
    if (a < 8) continue;
    qOpaque++;
    const key = hex(r, g, b);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const sorted = [...counts.entries()]
    .map(([hexColor, count]) => ({ hex: hexColor, pct: Math.round((count / qOpaque) * 10000) / 100 }))
    .sort((a, b) => b.pct - a.pct);

  // Merge near-duplicate quantized colors (JPEG noise, gradient banding) into
  // clusters before counting "how many colors" the art really has.
  const clusters = [];
  for (const c of sorted) {
    const target = clusters.find((cl) => colorDistance(cl.hex, c.hex) <= 48);
    if (target) target.pct += c.pct;
    else clusters.push({ hex: c.hex, pct: c.pct });
  }
  clusters.sort((a, b) => b.pct - a.pct);
  const significantClusters = clusters.filter((c) => c.pct >= 0.5);

  const isTwoTone =
    significantClusters.length >= 2 &&
    significantClusters[0].pct + significantClusters[1].pct >= 95 &&
    colorDistance(significantClusters[0].hex, significantClusters[1].hex) > 128;

  const uniqueColorsQuantized = significantClusters.length;
  const dominantColors = sorted.slice(0, 8);
  const uniqueColors = exactColors.size;

  const notes = [];
  if (width * height > 20_000_000) notes.push('large image (>20MP) — tracing may take a while');
  if (hasAlpha && transparentPct > 0) notes.push('has transparency — background will stay transparent');

  let suggestedEngine, suggestedMode, suggestedColors;
  if ((isTwoTone || (grayscale && uniqueColorsQuantized <= 2))) {
    suggestedEngine = 'potrace';
    suggestedMode = 'bw';
    suggestedColors = null;
    notes.push('two-tone/grayscale image — potrace + bw recommended');
  } else if (uniqueColorsQuantized <= 12) {
    suggestedEngine = 'vtracer';
    suggestedMode = 'color';
    suggestedColors = uniqueColorsQuantized;
    notes.push('flat color art detected — vtracer with limited palette recommended');
  } else {
    suggestedEngine = 'vtracer';
    suggestedMode = 'color';
    suggestedColors = null;
    notes.push('photo/gradient-like image — vtracer color recommended');
  }

  return {
    input,
    width,
    height,
    hasAlpha,
    transparentPct,
    uniqueColors,
    uniqueColorsQuantized,
    isGrayscale: grayscale,
    isTwoTone,
    dominantColors,
    suggestedEngine,
    suggestedMode,
    suggestedColors,
    notes,
  };
}

// ---------- engine presets (ported from mvp-pilot/image-vectorizer) ----------

const VTRACER_PRESETS = {
  low: { filterSpeckle: 8, colorPrecision: 4, layerDifference: 32, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 2, spliceThreshold: 45, pathPrecision: 2 },
  medium: { filterSpeckle: 4, colorPrecision: 6, layerDifference: 16, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 4, spliceThreshold: 45, pathPrecision: 4 },
  high: { filterSpeckle: 2, colorPrecision: 8, layerDifference: 8, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 8, spliceThreshold: 45, pathPrecision: 6 },
  ultra: { filterSpeckle: 1, colorPrecision: 8, layerDifference: 4, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 10, spliceThreshold: 45, pathPrecision: 8 },
};

const POTRACE_PRESETS = {
  low: { turdSize: 4, alphaMax: 1.5, optTolerance: 0.5 },
  medium: { turdSize: 2, alphaMax: 1.0, optTolerance: 0.2 },
  high: { turdSize: 1, alphaMax: 0.8, optTolerance: 0.1 },
  ultra: { turdSize: 0, alphaMax: 0.5, optTolerance: 0.05 },
};
const POTRACE_POSTERIZE_STEPS = { low: 2, medium: 3, high: 4, ultra: 6 };

// potrace binarizes/traces at the raster's own resolution, then the shape
// is scaled up for print — on a small source this bakes anti-aliasing and
// corner-rounding decisions in at low precision, producing blobby letters
// once exported large (rounded "S", skewed "T"). Supersampling the raster
// before tracing (so potrace's own threshold decision happens near print
// resolution) fixes this; it's not needed once the source is already big
// enough to be close to print-detail.
const POTRACE_SUPERSAMPLE_SOURCE_LIMIT = 2000;
const POTRACE_SUPERSAMPLE_TARGET_DIM = 3600;
const POTRACE_SUPERSAMPLE_MAX_FACTOR = 4;

function potraceSupersampleFactor(maxSourceDim) {
  if (maxSourceDim >= POTRACE_SUPERSAMPLE_SOURCE_LIMIT) return 1;
  return Math.min(POTRACE_SUPERSAMPLE_MAX_FACTOR, Math.ceil(POTRACE_SUPERSAMPLE_TARGET_DIM / maxSourceDim));
}

// Rewrite only the outer <svg ...> tag's width/height attributes (path data
// never contains that literal substring, but restrict the replace to the
// opening tag anyway to be safe).
function overrideOuterSvgSize(svg, width, height) {
  const m = svg.match(/^<svg\b[^>]*>/);
  if (!m) return svg;
  const tag = m[0].replace(/\bwidth="[^"]*"/, `width="${width}"`).replace(/\bheight="[^"]*"/, `height="${height}"`);
  return tag + svg.slice(m[0].length);
}

const IMAGETRACER_PRESET_MAP = { low: 'posterized1', medium: 'default', high: 'detailed', ultra: 'artistic1' };

async function runVtracer(pngBuffer, opts) {
  const preset = VTRACER_PRESETS[opts.preset];
  const config = {
    colorMode: opts.mode === 'color' ? VTColorMode.Color : VTColorMode.Binary,
    hierarchical: opts.separate ? Hierarchical.Cutout : Hierarchical.Stacked,
    mode: PathSimplifyMode.Spline,
    filterSpeckle: opts.filterSpeckle ?? preset.filterSpeckle,
    colorPrecision: opts.colorPrecision ?? preset.colorPrecision,
    layerDifference: preset.layerDifference,
    cornerThreshold: opts.cornerThreshold ?? preset.cornerThreshold,
    lengthThreshold: preset.lengthThreshold,
    maxIterations: preset.maxIterations,
    spliceThreshold: preset.spliceThreshold,
    pathPrecision: preset.pathPrecision,
  };
  return vtVectorize(pngBuffer, config);
}

function potraceTraceAsync(buf, opts) {
  return new Promise((resolve, reject) => {
    potrace.trace(buf, opts, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}
function potracePosterizeAsync(buf, opts) {
  return new Promise((resolve, reject) => {
    potrace.posterize(buf, opts, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

async function runPotrace(pngBuffer, opts) {
  const preset = POTRACE_PRESETS[opts.preset];
  const params = { ...preset };
  if (opts.threshold !== undefined) params.threshold = opts.threshold;

  if (opts.mode === 'color') {
    const steps = POTRACE_POSTERIZE_STEPS[opts.preset];
    return potracePosterizeAsync(pngBuffer, { ...params, steps });
  }
  return potraceTraceAsync(pngBuffer, params);
}

async function runImagetracer(rawImageData, opts) {
  const preset = IMAGETRACER_PRESET_MAP[opts.preset];
  const imgd = { data: Array.from(rawImageData.data), width: rawImageData.width, height: rawImageData.height };
  return ImageTracer.imagedataToSVG(imgd, preset);
}

// ---------- SVG post-processing ----------

function ensureViewBox(svg, width, height) {
  if (/viewBox\s*=/.test(svg)) return svg;
  return svg.replace(/<svg\b/, `<svg viewBox="0 0 ${width} ${height}"`);
}

// node-potrace emits path coordinates at ~3 decimal places (and imagetracer
// can carry similar excess precision) even though a 1-decimal grid is
// visually indistinguishable at print/screen size — this alone roughly
// doubles output size. VTracer already has its own pathPrecision option, so
// it's left untouched.
function roundPathPrecision(svg, decimals) {
  const factor = 10 ** decimals;
  return svg.replace(/d="([^"]*)"/g, (whole, d) => {
    const rounded = d.replace(/-?\d+\.\d+/g, (num) => {
      let r = Math.round(parseFloat(num) * factor) / factor;
      if (Object.is(r, -0)) r = 0;
      return String(r);
    });
    return `d="${rounded}"`;
  });
}

// Raw fill="..." value of a path tag, lowercased; null when absent (SVG
// default fill is black).
function fillAttrValue(pathTag) {
  const m = pathTag.match(/fill="([^"]+)"/);
  return m ? m[1].trim().toLowerCase() : null;
}

// Resolve a raw fill value (as returned by fillAttrValue) to [r, g, b].
function fillToRgb(raw) {
  if (raw === null || raw === 'black') return [0, 0, 0];
  if (raw === 'white') return [255, 255, 255];
  if (raw.startsWith('#')) {
    let h = raw.slice(1);
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    const num = parseInt(h.slice(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const m = raw.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return [0, 0, 0];
}

// Normalize a path's fill attribute to a #rrggbb hex string (default: black,
// the SVG initial value, when no fill attribute is present).
function normalizeFill(pathTag) {
  const raw = fillAttrValue(pathTag);
  if (raw === 'none') return 'none';
  const [r, g, b] = fillToRgb(raw);
  return hex(r, g, b);
}

// Snap every path's fill to the nearest color in a fixed palette (Euclidean
// RGB distance). Used after --colors N so the SVG never has more distinct
// fills than the requested palette size, regardless of engine.
function nearestPaletteHex(r, g, b, palette) {
  let best = palette[0].hex, bestDist = Infinity;
  for (const p of palette) {
    const d = (r - p.r) ** 2 + (g - p.g) ** 2 + (b - p.b) ** 2;
    if (d < bestDist) { bestDist = d; best = p.hex; }
  }
  return best;
}

function snapFillsToPalette(svg, palette) {
  return svg.replace(/<path\b[^>]*>/g, (tag) => {
    const raw = fillAttrValue(tag);
    if (raw === 'none') return tag;
    const [r, g, b] = fillToRgb(raw);
    const snapped = nearestPaletteHex(r, g, b, palette);
    if (raw === null) return tag.replace(/^<path\b/, `<path fill="${snapped}"`);
    return tag.replace(/fill="[^"]+"/, `fill="${snapped}"`);
  });
}

// Extract distinct fill colors and path counts from an SVG string.
function analyzeFills(svg) {
  const paths = svg.match(/<path\b[^>]*>/g) || [];
  const counts = new Map();
  for (const p of paths) {
    const fill = normalizeFill(p);
    counts.set(fill, (counts.get(fill) || 0) + 1);
  }
  const fills = [...counts.entries()]
    .map(([fillHex, paths2]) => ({ hex: fillHex, paths: paths2 }))
    .sort((a, b) => b.paths - a.paths);
  return { fills, fillCount: fills.length, pathCount: paths.length };
}

function svgForFill(svg, width, height, fillHex) {
  const paths = svg.match(/<path\b[^>]*>/g) || [];
  const kept = paths.filter((p) => normalizeFill(p) === fillHex);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${kept.join('')}</svg>`;
}

// ---------- fidelity ----------

async function computeFidelity(sourcePath, svgBuffer, width, height) {
  try {
    const longest = Math.max(width, height);
    const scale = longest > 1024 ? 1024 / longest : 1;
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const rendered = await sharp(svgBuffer, { density: 96 })
      .resize(w, h, { fit: 'fill' })
      .flatten({ background: '#ffffff' })
      .raw()
      .toBuffer();

    const original = await sharp(sourcePath)
      .resize(w, h, { fit: 'fill' })
      .flatten({ background: '#ffffff' })
      .raw()
      .toBuffer();

    let sum = 0;
    const n = Math.min(rendered.length, original.length);
    for (let i = 0; i < n; i++) sum += Math.abs(rendered[i] - original[i]);
    const meanAbsDiff = sum / n;
    return Math.round((1 - meanAbsDiff / 255) * 10000) / 10000;
  } catch (err) {
    log(`  fidelity check failed: ${err.message}`);
    return null;
  }
}

// ---------- engine selection ----------

async function pickEngine(input, requested, modeExplicit, opts) {
  if (requested && requested !== 'auto') return { engine: requested, mode: opts.mode };
  const insp = await inspectImage(input);
  const mode = modeExplicit ? opts.mode : insp.suggestedMode;
  return { engine: insp.suggestedEngine, mode, suggestedColors: insp.suggestedColors };
}

// ---------- trace ----------

function histogramEntries(histogram) {
  return [...histogram.entries()].map(([key, count]) => ({
    r: (key >> 16) & 255, g: (key >> 8) & 255, b: key & 255, count,
  }));
}

// Median-cut palette of at most k colors over a weighted color histogram.
// (sharp/libimagequant's `colors` option only picks a PNG bit-depth bucket —
// 2/4/16/256 — it does not reliably cap the output at an arbitrary small N,
// so we quantize ourselves instead.) Used as a fast initialization for the
// Lloyd refinement below.
function medianCutPalette(entries, k) {
  if (entries.length <= k) {
    return entries.map((e) => ({ hex: hex(e.r, e.g, e.b), r: e.r, g: e.g, b: e.b }));
  }

  // Weighted variance per channel, not raw min-max range: a handful of
  // stray antialiased-edge pixels can span the full channel range while
  // carrying negligible weight, which would otherwise keep winning the
  // split and prevent the dominant colors from ever separating.
  function weightedVariance(bucket, ch) {
    let total = 0, sum = 0;
    for (const e of bucket) { total += e.count; sum += e[ch] * e.count; }
    const mean = sum / total;
    let variance = 0;
    for (const e of bucket) variance += e.count * (e[ch] - mean) ** 2;
    return variance / total;
  }

  const buckets = [entries];
  while (buckets.length < k) {
    let idx = -1, bestVariance = -1, bestChannel = 'r';
    buckets.forEach((bucket, i) => {
      if (bucket.length < 2) return;
      for (const ch of ['r', 'g', 'b']) {
        const variance = weightedVariance(bucket, ch);
        if (variance > bestVariance) { bestVariance = variance; idx = i; bestChannel = ch; }
      }
    });
    if (idx === -1 || bestVariance <= 0) break; // buckets are single colors or uniform, can't usefully split further

    const bucket = buckets[idx];
    bucket.sort((a, b) => a[bestChannel] - b[bestChannel]);
    const total = bucket.reduce((s, e) => s + e.count, 0);
    let acc = 0, splitAt = 1;
    for (let i = 0; i < bucket.length; i++) {
      acc += bucket[i].count;
      if (acc >= total / 2) { splitAt = i + 1; break; }
    }
    splitAt = Math.min(Math.max(splitAt, 1), bucket.length - 1);
    buckets.splice(idx, 1, bucket.slice(0, splitAt), bucket.slice(splitAt));
  }

  return buckets.map((bucket) => {
    let rSum = 0, gSum = 0, bSum = 0, total = 0;
    for (const e of bucket) { rSum += e.r * e.count; gSum += e.g * e.count; bSum += e.b * e.count; total += e.count; }
    const r = Math.round(rSum / total), g = Math.round(gSum / total), b = Math.round(bSum / total);
    return { hex: hex(r, g, b), r, g, b };
  });
}

// Refine a starting palette with weighted Lloyd (k-means) iterations: assign
// every histogram entry to its nearest palette color, recompute each color
// as the weighted average of what it was assigned, repeat. Median-cut alone
// tends to leave the split boundaries a bit off from the true color centers.
function refinePaletteLloyd(entries, initialPalette, iterations) {
  let palette = initialPalette.map((p) => ({ ...p }));
  for (let iter = 0; iter < iterations; iter++) {
    const sums = palette.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (const e of entries) {
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        const d = (e.r - p.r) ** 2 + (e.g - p.g) ** 2 + (e.b - p.b) ** 2;
        if (d < bestDist) { bestDist = d; best = i; }
      }
      const s = sums[best];
      s.r += e.r * e.count; s.g += e.g * e.count; s.b += e.b * e.count; s.count += e.count;
    }
    let moved = false;
    palette = palette.map((p, i) => {
      const s = sums[i];
      if (s.count === 0) return p; // empty cluster this round, keep it in place
      const r = Math.round(s.r / s.count), g = Math.round(s.g / s.count), b = Math.round(s.b / s.count);
      if (r !== p.r || g !== p.g || b !== p.b) moved = true;
      return { hex: hex(r, g, b), r, g, b };
    });
    if (!moved) break;
  }
  return palette;
}

// Quantize to a bounded palette for --colors N. Ink is either printed or
// not: alpha is binarized first (>=128 -> opaque) and fully-transparent
// pixels get a constant RGB so they can't pull the palette or leave a
// translucent-edge halo of near-duplicate blended colors.
//
// The palette itself is built only from "flat" pixels (low local contrast,
// i.e. not an antialiased edge) so edge-blend colors can't waste a palette
// slot on a near-duplicate shade; falls back to all opaque pixels if too
// little of the image is flat. The histogram key is quantized to 5 bits per
// channel purely for speed (fewer distinct buckets to run median-cut/Lloyd
// over on a multi-megapixel image); the actual repaint at the end uses the
// full-precision final palette against every opaque pixel.
async function quantizeForPalette(input, colors) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const bin = Buffer.from(data);

  for (let i = 0; i < bin.length; i += 4) {
    if (bin[i + 3] >= 128) {
      bin[i + 3] = 255;
    } else {
      bin[i + 3] = 0;
      bin[i] = 255; bin[i + 1] = 255; bin[i + 2] = 255;
    }
  }

  const coarseKey = (r, g, b) => ((r & 0xf8) << 16) | ((g & 0xf8) << 8) | (b & 0xf8);
  const flatHistogram = new Map();
  const allHistogram = new Map();
  let opaqueCount = 0, flatCount = 0;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = (row + x) * 4;
      if (bin[idx + 3] === 0) continue;
      opaqueCount++;
      const key = coarseKey(bin[idx], bin[idx + 1], bin[idx + 2]);
      allHistogram.set(key, (allHistogram.get(key) || 0) + 1);

      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const nRow = ny * width;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const nIdx = (nRow + nx) * 4;
          const r = bin[nIdx], g = bin[nIdx + 1], b = bin[nIdx + 2];
          if (r < minR) minR = r; if (r > maxR) maxR = r;
          if (g < minG) minG = g; if (g > maxG) maxG = g;
          if (b < minB) minB = b; if (b > maxB) maxB = b;
        }
      }
      if (Math.max(maxR - minR, maxG - minG, maxB - minB) <= 24) {
        flatCount++;
        flatHistogram.set(key, (flatHistogram.get(key) || 0) + 1);
      }
    }
  }

  const histogram = flatCount / Math.max(opaqueCount, 1) >= 0.1 ? flatHistogram : allHistogram;
  const entries = histogramEntries(histogram);
  const initial = medianCutPalette(entries, colors);
  const palette = refinePaletteLloyd(entries, initial, 10);

  for (let i = 0; i < bin.length; i += 4) {
    if (bin[i + 3] === 0) continue;
    const snapped = nearestPaletteHex(bin[i], bin[i + 1], bin[i + 2], palette);
    const [r, g, b] = hexToRgb(snapped);
    bin[i] = r; bin[i + 1] = g; bin[i + 2] = b;
  }

  const png = await sharp(bin, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return { png, palette };
}

async function loadForEngine(input, colors) {
  let png, palette = null;
  if (colors) {
    ({ png, palette } = await quantizeForPalette(input, colors));
  } else {
    png = await sharp(input).png().toBuffer();
  }
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    png,
    palette,
    raw: { data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), width: info.width, height: info.height },
    width: info.width,
    height: info.height,
  };
}

async function traceOne(input, engineName, opts) {
  const { png, raw, width, height, palette } = await loadForEngine(input, opts.colors);
  const start = performance.now();
  let svg;
  let supersample; // k > 1 only for a small-source potrace trace
  let traceWidth = width, traceHeight = height; // the space path coordinates are actually in

  if (engineName === 'vtracer') {
    svg = await runVtracer(png, opts);
  } else if (engineName === 'potrace') {
    const k = potraceSupersampleFactor(Math.max(width, height));
    let potracePng = png;
    if (k > 1) {
      supersample = k;
      traceWidth = width * k;
      traceHeight = height * k;
      potracePng = await sharp(png).resize(traceWidth, traceHeight, { kernel: 'lanczos3' }).png().toBuffer();
    }
    svg = await runPotrace(potracePng, opts);
  } else if (engineName === 'imagetracer') {
    svg = await runImagetracer(raw, opts);
  } else {
    throw new Error(`unknown engine: ${engineName}`);
  }
  const ms = Math.round(performance.now() - start);

  // viewBox must match the space the paths are actually drawn in
  // (traceWidth/traceHeight); width/height attributes stay in original
  // source terms so aspect/export/fidelity math elsewhere is unaffected by
  // internal supersampling.
  svg = ensureViewBox(svg, traceWidth, traceHeight);
  if (supersample) svg = overrideOuterSvgSize(svg, width, height);

  // potrace's raw ~3-decimal coordinates roughly double output size for no
  // visible gain at the source's own resolution — but rounding to a fixed
  // decimal count is only safe if it stays sub-pixel after the SVG is later
  // scaled up for print (e.g. via `export` to a 4500px canvas). A 1px
  // rounding step on a 900px source becomes a 5px jag at 5x, visibly
  // distorting letterforms. Scale the precision to the space the path
  // coordinates are actually in (the supersampled size, when applicable) so
  // the rounding step is always sub-pixel at our largest print canvas.
  if (engineName === 'potrace' || engineName === 'imagetracer') {
    // The "+1" margin pushes the rounding step an extra order of magnitude
    // below 1 print-pixel. When supersampling already bought a full extra
    // order of magnitude of trace resolution, that margin is redundant —
    // drop it so files don't grow for no visible benefit (this is what
    // keeps a 900px->3600px supersampled trace at 1 decimal, not 2).
    const traceMaxDim = Math.max(traceWidth, traceHeight);
    const decimals = supersample
      ? Math.max(1, Math.ceil(Math.log10(4500 / traceMaxDim)))
      : Math.max(1, Math.ceil(Math.log10(4500 / traceMaxDim)) + 1);
    svg = roundPathPrecision(svg, decimals);
  }
  if (palette && palette.length) svg = snapFillsToPalette(svg, palette);
  return { svg, width, height, ms, supersample };
}

async function writeSeparations(svg, width, height, fills, outBase) {
  const dir = `${outBase}_separations`;
  await mkdir(dir, { recursive: true });
  const separations = [];
  let idx = 0;
  for (const f of fills) {
    idx++;
    const safeHex = f.hex.replace('#', '').replace(/[^0-9a-fA-F]/g, '_');
    const file = path.join(dir, `${String(idx).padStart(2, '0')}_${safeHex}.svg`);
    const sepSvg = svgForFill(svg, width, height, f.hex);
    await writeFile(file, sepSvg, 'utf-8');

    let coveragePct = null;
    try {
      const longest = Math.max(width, height);
      const scale = longest > 512 ? 512 / longest : 1;
      const w = Math.max(1, Math.round(width * scale));
      const h = Math.max(1, Math.round(height * scale));
      const raw = await sharp(Buffer.from(sepSvg), { density: 96 }).resize(w, h, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
      let covered = 0;
      for (let i = 0; i < raw.length; i += 4) if (raw[i + 3] >= 8) covered++;
      coveragePct = Math.round((covered / (w * h)) * 10000) / 100;
    } catch (err) {
      log(`  separation coverage failed for ${f.hex}: ${err.message}`);
    }

    separations.push({ hex: f.hex, file, paths: f.paths, coveragePct });
  }
  return separations;
}

async function cmdTrace(input, args) {
  const explicitMode = args.values.mode !== undefined;
  const opts = {
    preset: args.values.preset ?? 'medium',
    mode: args.values.mode ?? 'color',
    colors: args.values.colors ? Number(args.values.colors) : undefined,
    separate: !!args.values.separate,
    threshold: args.values.threshold !== undefined ? Number(args.values.threshold) : undefined,
    filterSpeckle: args.values['filter-speckle'] !== undefined ? Number(args.values['filter-speckle']) : undefined,
    colorPrecision: args.values['color-precision'] !== undefined ? Number(args.values['color-precision']) : undefined,
    cornerThreshold: args.values['corner-threshold'] !== undefined ? Number(args.values['corner-threshold']) : undefined,
  };

  const picked = await pickEngine(input, args.values.engine, explicitMode, opts);
  opts.mode = picked.mode;
  if (opts.colors === undefined && picked.suggestedColors && (args.values.engine ?? 'auto') === 'auto') {
    // leave colors undefined unless user asked; suggestion is informational via inspect
  }
  const engineName = picked.engine;

  const output = args.values.o ?? defaultSvgOutput(input);
  const { svg, width, height, ms, supersample } = await traceOne(input, engineName, opts);
  const { fills, fillCount, pathCount } = analyzeFills(svg);

  await ensureDir(output);
  await writeFile(output, svg, 'utf-8');
  const bytes = Buffer.byteLength(svg, 'utf-8');

  const fidelity = await computeFidelity(input, Buffer.from(svg), width, height);

  const result = {
    input,
    output,
    engine: engineName,
    preset: opts.preset,
    mode: opts.mode,
    colors: opts.colors ?? null,
    width,
    height,
    fills,
    fillCount,
    pathCount,
    bytes,
    ms,
    fidelity,
  };
  if (supersample) result.supersample = supersample;

  if (opts.separate) {
    const outBase = output.slice(0, -path.extname(output).length || undefined);
    result.separations = await writeSeparations(svg, width, height, fills, outBase);
  }

  printResult(result);
}

// ---------- compare ----------

async function renderPreview(svgBuffer, width, height, outPath) {
  const longest = Math.max(width, height);
  const scale = longest > 1024 ? 1024 / longest : 1;
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  await sharp(svgBuffer, { density: 96 }).resize(w, h, { fit: 'fill' }).flatten({ background: '#ffffff' }).png().toFile(outPath);
}

function labelSvg(text, w) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="28">
      <rect width="${w}" height="28" fill="#000000"/>
      <text x="6" y="20" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">${text}</text>
    </svg>`
  );
}

async function buildContactSheet(originalPath, tiles, outPath) {
  const tileSize = 512;
  const labelH = 28;
  const cellH = tileSize + labelH;
  const items = [{ label: 'original', path: originalPath }, ...tiles];

  const cells = [];
  for (const item of items) {
    const buf = await sharp(item.path).resize(tileSize, tileSize, { fit: 'contain', background: '#ffffff' }).png().toBuffer();
    cells.push(buf);
  }

  const width = tileSize * items.length;
  const height = cellH;
  const composites = [];
  items.forEach((item, i) => {
    composites.push({ input: cells[i], left: i * tileSize, top: 0 });
    composites.push({ input: labelSvg(item.label, tileSize), left: i * tileSize, top: tileSize });
  });

  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(composites)
    .png()
    .toFile(outPath);
}

async function cmdCompare(input, args) {
  const explicitMode = args.values.mode !== undefined;
  const opts = {
    preset: args.values.preset ?? 'medium',
    mode: args.values.mode ?? 'color',
    colors: args.values.colors ? Number(args.values.colors) : undefined,
  };
  const dir = args.values.d ?? defaultCompareDir(input);
  await mkdir(dir, { recursive: true });
  const base = path.basename(input, path.extname(input));

  const meta = await sharp(input).metadata();
  const megapixels = (meta.width * meta.height) / 1_000_000;

  // Same auto-mode rule as trace: when --mode isn't given, follow inspect's
  // suggestion (e.g. a two-tone scan should be compared in bw, not have
  // potrace fall back to posterize just because that's the global default).
  if (!explicitMode) {
    const insp = await inspectImage(input);
    opts.mode = insp.suggestedMode;
  }

  const engines = ['vtracer', 'potrace', 'imagetracer'];
  const results = [];
  const tiles = [];

  for (const engineName of engines) {
    const outPath = path.join(dir, `${base}.${engineName}.svg`);
    const previewPath = path.join(dir, `${base}.${engineName}.png`);
    try {
      let engineInput = input;
      let downscaleNote;
      let targetWidth = meta.width, targetHeight = meta.height;

      if (engineName === 'imagetracer' && megapixels > 4) {
        const scale = Math.sqrt(4_000_000 / (meta.width * meta.height));
        targetWidth = Math.round(meta.width * scale);
        targetHeight = Math.round(meta.height * scale);
        downscaleNote = `downscaled to ${targetWidth}x${targetHeight} for imagetracer`;
        engineInput = await sharp(input).resize(targetWidth, targetHeight).toBuffer();
      }

      const { svg: rawSvg, width, height, ms, supersample } = await traceOne(engineInput, engineName, opts);
      // for downscaled imagetracer: viewBox = downscaled size, width/height attrs = original
      let svg = rawSvg;
      if (downscaleNote) {
        svg = svg.replace(/<svg\b([^>]*)\bwidth="[^"]*"([^>]*)\bheight="[^"]*"/, `<svg$1width="${meta.width}"$2height="${meta.height}"`);
      }

      const { fills, fillCount, pathCount } = analyzeFills(svg);
      await writeFile(outPath, svg, 'utf-8');
      const bytes = Buffer.byteLength(svg, 'utf-8');
      await renderPreview(Buffer.from(svg), downscaleNote ? targetWidth : width, downscaleNote ? targetHeight : height, previewPath);
      const fidelity = await computeFidelity(input, Buffer.from(svg), width, height);

      const entry = { engine: engineName, output: outPath, preview: previewPath, bytes, pathCount, fillCount, ms, fidelity };
      if (supersample) entry.supersample = supersample;
      if (downscaleNote) {
        entry.note = downscaleNote;
        // Traced from a downscaled copy: it lost detail relative to the
        // full-resolution traces, so it can't be recommended as the
        // scalable print master unless it's the only one that succeeded.
        entry.eligible = false;
      }
      results.push(entry);
      tiles.push({ label: engineName, path: previewPath });
    } catch (err) {
      log(`  [${engineName}] failed: ${err.message}`);
      results.push({ engine: engineName, error: err.message });
    }
  }

  const contactSheet = path.join(dir, `${base}.contact.png`);
  try {
    await buildContactSheet(input, tiles, contactSheet);
  } catch (err) {
    log(`  contact sheet failed: ${err.message}`);
  }

  // Rank by a size-aware score, not raw fidelity: a huge SVG that traces
  // JPEG noise (e.g. imagetracer on a photo) can out-score a compact, clean
  // trace on fidelity alone, which is a bad recommendation for print.
  const ok = results.filter((r) => !r.error && typeof r.fidelity === 'number');
  let best = null;
  if (ok.length) {
    const minBytes = Math.min(...ok.map((r) => r.bytes));
    for (const r of ok) {
      r.score = Math.round((r.fidelity - 0.01 * Math.log2(r.bytes / minBytes)) * 10000) / 10000;
    }
    // Ineligible (downscaled) results are only picked as best when nothing
    // else succeeded — otherwise a lower-resolution trace could win purely
    // by being small, which isn't a usable scalable master.
    const eligible = ok.filter((r) => r.eligible !== false);
    const candidates = eligible.length ? eligible : ok;
    best = candidates.reduce((a, b) => {
      if (b.score > a.score) return b;
      if (b.score === a.score && b.bytes < a.bytes) return b;
      return a;
    }).engine;
  }

  printResult({ input, dir, contactSheet, results, best });
}

// ---------- preview ----------

function parseCrop(str) {
  const parts = str.split(',').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error(`invalid --crop "${str}": expected "x,y,w,h" fractions`);
  }
  const [x, y, w, h] = parts;
  if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1 || y + h > 1) {
    throw new Error(`invalid --crop "${str}": must be fractions in [0,1] with x+w<=1 and y+h<=1`);
  }
  return { x, y, w, h };
}

function checkerboardPng(width, height) {
  const tile = 16;
  const buf = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const light = (((x / tile) | 0) + ((y / tile) | 0)) % 2 === 0;
      const v = light ? 235 : 205;
      const idx = (y * width + x) * 3;
      buf[idx] = v; buf[idx + 1] = v; buf[idx + 2] = v;
    }
  }
  return sharp(buf, { raw: { width, height, channels: 3 } });
}

// Composite a rendered (possibly transparent) RGBA buffer onto the chosen
// background and return an encoded PNG. checker/transparent make it obvious
// whether ink is genuinely transparent vs. white, which a flat white bg
// would hide.
async function applyBackground(rgba, width, height, bg) {
  if (bg === 'transparent') {
    return sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }
  if (bg === 'checker') {
    return checkerboardPng(width, height)
      .composite([{ input: rgba, raw: { width, height, channels: 4 } }])
      .png()
      .toBuffer();
  }
  const color = bg === 'white' ? '#ffffff' : bg === 'black' ? '#000000' : bg;
  return sharp(rgba, { raw: { width, height, channels: 4 } }).flatten({ background: color }).png().toBuffer();
}

const PREVIEW_RENDER_CAP = 12000;

// Render an SVG (optionally cropped to a fraction-of-canvas region) so that
// the crop region itself is `size` px on its longest side — a true vector
// zoom via render density, not an upscaled low-res raster.
async function renderSvgRegion(svgBuffer, svgWidth, svgHeight, crop, size) {
  const cropW = crop ? crop.w * svgWidth : svgWidth;
  const cropH = crop ? crop.h * svgHeight : svgHeight;
  let scale = size / Math.max(cropW, cropH);
  let note;

  const fullLongest = Math.max(svgWidth, svgHeight) * scale;
  if (fullLongest > PREVIEW_RENDER_CAP) {
    scale = PREVIEW_RENDER_CAP / Math.max(svgWidth, svgHeight);
    note = `full render capped at ${PREVIEW_RENDER_CAP}px longest side; crop region is smaller than the requested --size`;
  }

  const fullWidth = Math.max(1, Math.round(svgWidth * scale));
  const fullHeight = Math.max(1, Math.round(svgHeight * scale));

  let img = sharp(svgBuffer, { density: 72 * scale }).ensureAlpha().resize(fullWidth, fullHeight, { fit: 'fill' });

  if (crop) {
    const left = Math.min(fullWidth - 1, Math.round(crop.x * fullWidth));
    const top = Math.min(fullHeight - 1, Math.round(crop.y * fullHeight));
    const width = Math.max(1, Math.min(Math.round(crop.w * fullWidth), fullWidth - left));
    const height = Math.max(1, Math.min(Math.round(crop.h * fullHeight), fullHeight - top));
    img = img.extract({ left, top, width, height });
  }

  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { rgba: data, width: info.width, height: info.height, note };
}

async function buildSideBySide(leftPng, rightPng, tileW, tileH, leftLabel, rightLabel) {
  const labelH = 28;
  const composites = [
    { input: leftPng, left: 0, top: 0 },
    { input: labelSvg(leftLabel, tileW), left: 0, top: tileH },
    { input: rightPng, left: tileW, top: 0 },
    { input: labelSvg(rightLabel, tileW), left: tileW, top: tileH },
  ];
  return sharp({ create: { width: tileW * 2, height: tileH + labelH, channels: 3, background: '#ffffff' } })
    .composite(composites)
    .png()
    .toBuffer();
}

async function buildLabeledSheet(tiles, outPath) {
  const cell = 320;
  const labelH = 28;
  const composites = [];
  tiles.forEach((t, i) => {
    const left = i * cell + Math.round((cell - t.width) / 2);
    const top = Math.round((cell - t.height) / 2);
    composites.push({ input: t.buffer, left, top });
    composites.push({ input: labelSvg(t.label, cell), left: i * cell, top: cell });
  });
  await sharp({ create: { width: cell * tiles.length, height: cell + labelH, channels: 3, background: '#ffffff' } })
    .composite(composites)
    .png()
    .toFile(outPath);
}

function defaultPreviewOutput(svgPath, hasCrop) {
  const dir = path.dirname(svgPath);
  const base = path.basename(svgPath, path.extname(svgPath));
  return path.join(dir, base + (hasCrop ? '.crop.png' : '.preview.png'));
}

async function previewSingle(svgPath, opts) {
  const svgBuffer = await readFile(svgPath);
  const meta = await sharp(svgBuffer).metadata();
  const { rgba, width, height, note } = await renderSvgRegion(svgBuffer, meta.width, meta.height, opts.crop, opts.size);
  const vectorPng = await applyBackground(rgba, width, height, opts.bg);

  let outputBuffer = vectorPng;
  if (opts.source) {
    const srcMeta = await sharp(opts.source).metadata();
    const region = opts.crop ?? { x: 0, y: 0, w: 1, h: 1 };
    const sx = Math.min(srcMeta.width - 1, Math.round(region.x * srcMeta.width));
    const sy = Math.min(srcMeta.height - 1, Math.round(region.y * srcMeta.height));
    const sw = Math.max(1, Math.min(Math.round(region.w * srcMeta.width), srcMeta.width - sx));
    const sh = Math.max(1, Math.min(Math.round(region.h * srcMeta.height), srcMeta.height - sy));
    const upscaling = sw < width || sh < height;

    const { data: srcRgba } = await sharp(opts.source)
      .extract({ left: sx, top: sy, width: sw, height: sh })
      .resize(width, height, { fit: 'fill', kernel: upscaling ? 'nearest' : 'lanczos3' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const sourcePng = await applyBackground(srcRgba, width, height, opts.bg);
    outputBuffer = await buildSideBySide(sourcePng, vectorPng, width, height, 'source', 'vector');
  }

  const output = opts.output ?? defaultPreviewOutput(svgPath, !!opts.crop);
  await ensureDir(output);
  await writeFile(output, outputBuffer);
  const outMeta = await sharp(outputBuffer).metadata();

  const result = { previews: [{ svg: svgPath, png: output, width: outMeta.width, height: outMeta.height }] };
  if (note) result.note = note;
  return result;
}

async function previewDirectory(dirPath, opts) {
  const files = (await readdir(dirPath)).filter((f) => f.toLowerCase().endsWith('.svg')).sort();
  if (!files.length) throw new Error(`no .svg files found in "${dirPath}"`);

  const previews = [];
  const tiles = [];
  let note;
  for (const file of files) {
    const svgPath = path.join(dirPath, file);
    const svgBuffer = await readFile(svgPath);
    const meta = await sharp(svgBuffer).metadata();
    const { rgba, width, height, note: n } = await renderSvgRegion(svgBuffer, meta.width, meta.height, null, opts.size);
    if (n) note = n;

    const png = await applyBackground(rgba, width, height, opts.bg);
    const outPath = svgPath.replace(/\.svg$/i, '.preview.png');
    await writeFile(outPath, png);
    previews.push({ svg: svgPath, png: outPath, width, height });

    const tileBuf = await sharp(png).resize(320, 320, { fit: 'inside' }).png().toBuffer();
    const tileMeta = await sharp(tileBuf).metadata();
    tiles.push({ label: file.replace(/\.svg$/i, ''), buffer: tileBuf, width: tileMeta.width, height: tileMeta.height });
  }

  const sheet = path.join(dirPath, '_sheet.png');
  await buildLabeledSheet(tiles, sheet);

  const result = { previews, sheet };
  if (note) result.note = note;
  return result;
}

async function cmdPreview(inputPath, args) {
  const size = args.values.size ? Number(args.values.size) : 1024;
  const bg = args.values.bg ?? 'checker';
  if (!['checker', 'white', 'black', 'transparent'].includes(bg) && !/^#[0-9a-fA-F]{3,8}$/.test(bg)) {
    throw new Error(`invalid --bg "${bg}": expected checker|white|black|transparent|#hex`);
  }
  const crop = args.values.crop ? parseCrop(args.values.crop) : null;

  const st = await stat(inputPath).catch(() => null);
  if (!st) throw new Error(`cannot read "${inputPath}": no such file or directory`);

  if (st.isDirectory()) {
    const result = await previewDirectory(inputPath, { size, bg });
    printResult(result);
    return;
  }
  const result = await previewSingle(inputPath, { size, bg, crop, source: args.values.source, output: args.values.o });
  printResult(result);
}

// ---------- export ----------

const EXPORT_CANVASES = {
  '1:1': { width: 4500, height: 4500 },
  '5:6': { width: 4500, height: 5400 },
};
const EXPORT_ASPECT_TOLERANCE = 0.01; // ±1%

function closestExportCanvas(sourceAspect) {
  let name = null, diff = Infinity;
  for (const [candidate, c] of Object.entries(EXPORT_CANVASES)) {
    const targetAspect = c.width / c.height;
    const d = Math.abs(sourceAspect / targetAspect - 1);
    if (d < diff) { diff = d; name = candidate; }
  }
  return { name, diff };
}

function defaultExportOutput(svgPath, width, height) {
  const dir = path.dirname(svgPath);
  const base = path.basename(svgPath, path.extname(svgPath));
  return path.join(dir, `${base}.${width}x${height}.png`);
}

async function cmdExport(svgPath, args) {
  const ratioArg = args.values.ratio ?? 'auto';
  if (!['auto', ...Object.keys(EXPORT_CANVASES)].includes(ratioArg)) {
    throw new Error(`invalid --ratio "${ratioArg}": expected one of auto, ${Object.keys(EXPORT_CANVASES).join(', ')}`);
  }

  const st = await stat(svgPath).catch(() => null);
  if (!st || !st.isFile()) throw new Error(`cannot read "${svgPath}": no such file`);

  const svgBuffer = await readFile(svgPath);
  const meta = await sharp(svgBuffer).metadata();
  if (!meta.width || !meta.height) throw new Error(`cannot determine dimensions of "${svgPath}"`);
  const sourceAspect = meta.width / meta.height;

  let ratioName;
  if (ratioArg === 'auto') {
    ratioName = closestExportCanvas(sourceAspect).name;
  } else {
    ratioName = ratioArg;
  }
  const canvas = EXPORT_CANVASES[ratioName];
  const targetAspect = canvas.width / canvas.height;
  const fit = Math.abs(sourceAspect / targetAspect - 1) <= EXPORT_ASPECT_TOLERANCE ? 'exact' : 'padded';

  const start = performance.now();
  let outBuffer;
  if (fit === 'exact') {
    // Render natively at (near) the exact target size, then a <1% fill
    // resize only to correct the tiny rounding/aspect slack — not a
    // render-small-then-upscale.
    const scale = canvas.width / meta.width;
    outBuffer = await sharp(svgBuffer, { density: 72 * scale })
      .ensureAlpha()
      .resize(canvas.width, canvas.height, { fit: 'fill' })
      .png()
      .withMetadata({ density: 300 })
      .toBuffer();
  } else {
    const scale = Math.min(canvas.width / meta.width, canvas.height / meta.height);
    const artWidth = Math.max(1, Math.round(meta.width * scale));
    const artHeight = Math.max(1, Math.round(meta.height * scale));
    const artBuffer = await sharp(svgBuffer, { density: 72 * scale })
      .ensureAlpha()
      .resize(artWidth, artHeight, { fit: 'fill' })
      .png()
      .toBuffer();
    const left = Math.round((canvas.width - artWidth) / 2);
    const top = Math.round((canvas.height - artHeight) / 2);
    outBuffer = await sharp({
      create: { width: canvas.width, height: canvas.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: artBuffer, left, top }])
      .png()
      .withMetadata({ density: 300 })
      .toBuffer();
  }
  const ms = Math.round(performance.now() - start);

  const output = args.values.o ?? defaultExportOutput(svgPath, canvas.width, canvas.height);
  await ensureDir(output);
  await writeFile(output, outBuffer);

  const result = {
    input: svgPath,
    output,
    ratio: ratioName,
    width: canvas.width,
    height: canvas.height,
    sourceAspect: Math.round(sourceAspect * 10000) / 10000,
    fit,
    dpi: 300,
    bytes: outBuffer.length,
    ms,
  };
  if (fit === 'padded') {
    result.note = `source aspect ${result.sourceAspect} is not within 1% of ${ratioName} — scaled to fit and centered with transparent padding, not cropped or stretched`;
  }
  printResult(result);
}

// ---------- CLI ----------

function usage() {
  return `Usage:
  node vectorize.mjs inspect <image>
  node vectorize.mjs trace   <image> [-o out.svg] [--engine auto|vtracer|potrace|imagetracer]
                              [--preset low|medium|high|ultra] [--mode color|bw]
                              [--colors N] [--separate] [--threshold 0-255]
                              [--filter-speckle N] [--color-precision N] [--corner-threshold N]
  node vectorize.mjs compare <image> [-d outdir] [--preset ...] [--mode ...] [--colors N]
  node vectorize.mjs preview <svg-or-dir> [-o out.png] [--size 1024]
                              [--bg checker|white|black|#hex|transparent]
                              [--crop x,y,w,h] [--source <raster>]
  node vectorize.mjs export  <svg> [-o out.png] [--ratio auto|1:1|5:6]`;
}

const COMMANDS = ['inspect', 'trace', 'compare', 'preview', 'export'];
const SELF_VALIDATING_COMMANDS = ['preview', 'export']; // take an SVG/dir, not a raster

async function main() {
  const [, , command, ...rest] = process.argv;
  if (!command || !COMMANDS.includes(command)) {
    log(usage());
    fail('missing or unknown command');
    return;
  }

  const args = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      o: { type: 'string' },
      d: { type: 'string' },
      engine: { type: 'string' },
      preset: { type: 'string' },
      mode: { type: 'string' },
      colors: { type: 'string' },
      separate: { type: 'boolean' },
      threshold: { type: 'string' },
      'filter-speckle': { type: 'string' },
      'color-precision': { type: 'string' },
      'corner-threshold': { type: 'string' },
      size: { type: 'string' },
      bg: { type: 'string' },
      crop: { type: 'string' },
      source: { type: 'string' },
      ratio: { type: 'string' },
    },
  });

  const input = args.positionals[0];
  if (!input) {
    fail('missing <image> argument');
    return;
  }

  // preview/export accept an SVG or a directory, not a raster, so they do
  // their own input validation instead of the raster-readability check below.
  if (SELF_VALIDATING_COMMANDS.includes(command)) {
    try {
      if (command === 'preview') await cmdPreview(input, args);
      else await cmdExport(input, args);
    } catch (err) {
      log(err.stack || err.message);
      fail(err.message);
    }
    return;
  }

  try {
    await sharp(input).metadata(); // throws if unreadable
  } catch (err) {
    fail(`cannot read image "${input}": ${err.message}`);
    return;
  }

  try {
    if (command === 'inspect') {
      printResult(await inspectImage(input));
    } else if (command === 'trace') {
      await cmdTrace(input, args);
    } else if (command === 'compare') {
      await cmdCompare(input, args);
    }
  } catch (err) {
    log(err.stack || err.message);
    fail(err.message);
  }
}

main();
