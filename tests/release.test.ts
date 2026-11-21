/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AppData } from '../src/data/store';
import {
  priorUse,
  shouldShowWhatsNew,
  WHATS_NEW,
  WHATS_NEW_FOOTER,
  WHATS_NEW_RELEASE,
} from '../src/release/whatsNew';
import {
  afterAccomplishment,
  afterUpgrade,
  ASK_AFTER_ACCOMPLISHMENTS,
  DAYS_BETWEEN_ASKS,
} from '../src/review/policy';

describe("What's New", () => {
  it('is shown to someone who was here before this release', () => {
    assert.equal(shouldShowWhatsNew({ welcomeSeen: true }), true);
    assert.equal(shouldShowWhatsNew({ welcomeSeen: true, whatsNewSeen: '1.0' }), true);
  });

  it('is not shown on a fresh install, where the welcome comes first', () => {
    assert.equal(shouldShowWhatsNew({}), false);
    assert.equal(shouldShowWhatsNew({ welcomeSeen: false }), false);
  });

  it('is shown once per release', () => {
    assert.equal(shouldShowWhatsNew({ welcomeSeen: true, whatsNewSeen: WHATS_NEW_RELEASE }), false);
  });

  it('follows the voice rules: no exclamation marks, US spelling', () => {
    const copy = [WHATS_NEW_FOOTER, ...WHATS_NEW.flatMap((item) => [item.title, item.body])];
    for (const line of copy) {
      assert.ok(!line.includes('!'), line);
      assert.ok(!/licence/i.test(line), line);
    }
  });

  it('counts the saves the review policy counts', () => {
    const data = {
      credentials: [{}, {}],
      seasons: [{ windows: [{}] }, { windows: [] }],
      drawApplications: [{}],
      activities: [{}, {}, {}],
    } as unknown as AppData;
    assert.equal(priorUse(data), 2 + 1 + 1 + 3);
  });
});

describe('Rating handoff after an upgrade', () => {
  it('asks someone who already did what the policy asks for', () => {
    const { next, ask } = afterUpgrade(undefined, ASK_AFTER_ACCOMPLISHMENTS, '2026-12-01');
    assert.equal(ask, true);
    assert.deepEqual(next, { accomplishments: 0, lastAskedOn: '2026-12-01' });
  });

  it('carries lighter use over, so the next ordinary save is the one that asks', () => {
    const { next, ask } = afterUpgrade(undefined, 2, '2026-12-01');
    assert.equal(ask, false);
    assert.equal(next.accomplishments, ASK_AFTER_ACCOMPLISHMENTS - 1);
    assert.equal(afterAccomplishment(next, '2026-12-02').ask, true);
  });

  it('never asks someone with nothing saved', () => {
    const { next, ask } = afterUpgrade(undefined, 0, '2026-12-01');
    assert.equal(ask, false);
    assert.equal(next.accomplishments, 0);
  });

  it('respects the spacing between asks', () => {
    const recent = { accomplishments: 0, lastAskedOn: '2026-11-01' };
    assert.equal(afterUpgrade(recent, 40, '2026-12-01').ask, false);
    const rested = { accomplishments: 0, lastAskedOn: '2026-01-01' };
    assert.ok(DAYS_BETWEEN_ASKS < 334);
    assert.equal(afterUpgrade(rested, 40, '2026-12-01').ask, true);
  });

  it('does not lower a count already in progress', () => {
    const { next } = afterUpgrade({ accomplishments: 2 }, 0, '2026-12-01');
    assert.equal(next.accomplishments, 2);
  });
});
