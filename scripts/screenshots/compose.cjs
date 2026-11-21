#!/usr/bin/env node
/**
 * Builds the App Store frames in screenshots/out/ from simulator captures in
 * screenshots/raw/, using the story and crops in frames.mjs.
 *
 *   node scripts/screenshots/compose.cjs            all eight
 *   node scripts/screenshots/compose.cjs 03 05      only those
 *
 * Drawing is done by render.swift (AppKit, so the headline is set in the system
 * font, same as the app). Needs a Mac with Xcode; nothing to install from npm.
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
  const { CANVAS, CAPTURE, STYLE, FRAMES } = await import(
    pathToFileURL(join(__dirname, 'frames.mjs')).href
  );

  const only = process.argv.slice(2);
  const frames = FRAMES.filter((f) => only.length === 0 || only.some((p) => f.out.startsWith(p)));

  const missing = frames.filter((f) => !existsSync(join(raw, f.source)));
  if (missing.length) {
    console.error(
      'Missing captures in screenshots/raw/:\n' +
        missing.map((f) => `  ${f.source} (for ${f.out})`).join('\n')
    );
    process.exit(1);
  }

  for (const f of frames) {
    if (/!/.test(f.headline + (f.sub ?? ''))) {
      console.error(`${f.out}: no exclamation marks (AGENTS.md)`);
      process.exit(1);
    }
    for (const c of f.cards ?? []) {
      if (c.x < 0 || c.y < 0 || c.x + c.w > CAPTURE.width || c.y + c.h > CAPTURE.height) {
        console.error(`${f.out}: crop "${c.name}" falls outside a ${CAPTURE.width}×${CAPTURE.height} capture`);
        process.exit(1);
      }
    }
  }

  mkdirSync(out, { recursive: true });
  const spec = {
    width: CANVAS.width,
    height: CANVAS.height,
    captureWidth: CAPTURE.width,
    ...STYLE,
    frames: frames.map((f) => ({
      out: join(out, f.out),
      source: join(raw, f.source),
      headline: f.headline,
      sub: f.sub ?? null,
      plan: f.plan ?? null,
      full: Boolean(f.full),
      cards: f.cards ?? [],
    })),
  };
  const specPath = join(tmpdir(), `htlt-frames-${process.pid}.json`);
  writeFileSync(specPath, JSON.stringify(spec));

  execFileSync('xcrun', ['swift', join(__dirname, 'render.swift'), specPath], { stdio: 'inherit' });
})();
