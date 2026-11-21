#!/usr/bin/env node
/**
 * Builds the App Store frames in screenshots/out/ from simulator captures in
 * screenshots/raw/, using the story and pop-outs in frames.mjs.
 *
 *   node scripts/screenshots/compose.cjs            all eight
 *   node scripts/screenshots/compose.cjs 03 05      only those
 *
 * Drawing is done by render.swift (AppKit, so headlines are set in SF Pro Rounded,
 * a system font). Needs a Mac with Xcode; nothing to install from npm.
 */
const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { pathToFileURL } = require('node:url');

const root = join(__dirname, '..', '..');
const raw = join(root, 'screenshots', 'raw');
const out = join(root, 'screenshots', 'out');

(async () => {
  const { CANVAS, CAPTURE, STYLE, FRAMES, HEADLINE_MAX, SUB_SIZE } = await import(
    pathToFileURL(join(__dirname, 'frames.mjs')).href
  );

  const only = process.argv.slice(2);
  const frames = FRAMES.filter((f) => only.length === 0 || only.some((p) => f.out.startsWith(p)));

  const missing = frames.flatMap((f) =>
    [f.source, f.pop?.source]
      .filter((name) => name && !existsSync(join(raw, name)))
      .map((name) => `  ${name} (for ${f.out})`)
  );
  if (missing.length) {
    console.error('Missing captures in screenshots/raw/:\n' + [...new Set(missing)].join('\n'));
    process.exit(1);
  }

  for (const f of frames) {
    if (/!/.test(f.headline + (f.sub ?? ''))) {
      console.error(`${f.out}: no exclamation marks (AGENTS.md)`);
      process.exit(1);
    }
    if (f.pop && (f.pop.y < 0 || f.pop.y + f.pop.h > CAPTURE.height)) {
      console.error(`${f.out}: pop-out "${f.pop.name}" falls outside a ${CAPTURE.width}×${CAPTURE.height} capture`);
      process.exit(1);
    }
    if (f.headline.split('\n').length > 2 || (f.sub ?? '').split('\n').length > 2) {
      console.error(`${f.out}: keep the headline and the subline to two lines each`);
      process.exit(1);
    }
  }

  mkdirSync(out, { recursive: true });
  const spec = {
    width: CANVAS.width,
    height: CANVAS.height,
    ...STYLE,
    headlineMax: HEADLINE_MAX,
    subSize: SUB_SIZE,
    // Every headline, so one frame rendered alone gets the same size as the set.
    allHeadlines: FRAMES.map((f) => f.headline),
    frames: frames.map((f) => ({
      out: join(out, f.out),
      source: join(raw, f.source),
      headline: f.headline,
      sub: f.sub ?? null,
      plan: f.plan ?? null,
      pop: f.pop ? { ...f.pop, source: f.pop.source ? join(raw, f.pop.source) : null } : null,
    })),
  };
  const specPath = join(tmpdir(), `htlt-frames-${process.pid}.json`);
  writeFileSync(specPath, JSON.stringify(spec));

  execFileSync('xcrun', ['swift', join(__dirname, 'render.swift'), specPath], { stdio: 'inherit' });
})();
