/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { freeTrialLength, planCopy } from '../src/purchases/offer';
import { FAMILY_FEATURES, FREE_LINE, OUTDOORSMAN_FEATURES } from '../src/purchases/paywallCopy';
import { startEntitlementSync } from '../src/purchases/sync';
import { restoreMessage, restoreOutcome, tierFrom } from '../src/purchases/tiers';

const outdoorsman = { entitlements: { active: { outdoorsman: {} } } };
const family = { entitlements: { active: { family: {}, outdoorsman: {} } } };
const nothing = { entitlements: { active: {} } };

describe('tierFrom', () => {
  it('prefers the higher tier', () => {
    assert.equal(tierFrom(family), 'family');
    assert.equal(tierFrom(outdoorsman), 'outdoorsman');
    assert.equal(tierFrom(nothing), 'free');
    assert.equal(tierFrom(null), 'free');
  });
});

describe('restore', () => {
  // Regression: restore used to dismiss the paywall whatever it found, so someone with
  // no purchase on this Apple Account was told nothing at all.
  it('reports when there is nothing to restore', () => {
    const outcome = restoreOutcome(nothing, true);
    assert.equal(outcome.status, 'nothing');
    assert.match(restoreMessage(outcome).title, /Nothing to restore/);
  });

  it('reports the tier that came back', () => {
    const outcome = restoreOutcome(family, true);
    assert.deepEqual(outcome, { status: 'restored', tier: 'family' });
    assert.match(restoreMessage(outcome).message, /Family is active/);
  });

  it('says restore is unavailable when the SDK is not configured', () => {
    assert.equal(restoreOutcome(null, false).status, 'unavailable');
  });
});

describe('trial copy', () => {
  const sevenDays = { price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7, cycles: 1 };

  it('names a free trial', () => {
    assert.deepEqual(freeTrialLength(sevenDays), { phrase: '7 days', adjective: '7-day' });
    assert.deepEqual(
      freeTrialLength({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 }),
      { phrase: '1 week', adjective: '1-week' }
    );
  });

  it('does not call a paid intro price a free trial', () => {
    assert.equal(freeTrialLength({ ...sevenDays, price: 0.99 }), null);
    assert.equal(freeTrialLength(null), null);
  });

  it('always shows the price that will be billed', () => {
    const copy = planCopy({
      tierName: 'Outdoorsman',
      priceString: '$19.99',
      intro: sevenDays,
      trialEligible: true,
    });
    assert.equal(copy.label, 'Try Outdoorsman Free');
    assert.equal(copy.detail, '7 days free, then $19.99 a year');
    assert.match(copy.terms ?? '', /7-day trial, Outdoorsman renews at \$19\.99 a year/);
  });

  // Someone who already used the trial would be billed on day one. The button must not
  // promise them a free week.
  it('never offers a trial to someone who is not eligible', () => {
    const copy = planCopy({
      tierName: 'Outdoorsman',
      priceString: '$19.99',
      intro: sevenDays,
      trialEligible: false,
    });
    assert.equal(copy.label, 'Outdoorsman');
    assert.equal(copy.detail, '$19.99 a year');
    assert.equal(copy.terms, null);
    assert.doesNotMatch(copy.detail, /free/i);
  });
});

describe('paywall feature lists', () => {
  // Regression: the Outdoorsman list sold reminders and "every state and province",
  // both of which are free on every tier (docs/pricing.md).
  const freeOnEveryTier = [/remind/i, /every state/i, /province/i, /journal/i, /photo/i, /export your data/i];

  for (const [name, list] of [
    ['Outdoorsman', OUTDOORSMAN_FEATURES],
    ['Family', FAMILY_FEATURES],
  ] as const) {
    it(`${name} lists only what it adds`, () => {
      for (const line of list) {
        for (const free of freeOnEveryTier) {
          assert.doesNotMatch(line, free, `"${line}" sells something Free already has`);
        }
      }
    });
  }

  it('says what Free keeps', () => {
    assert.match(FREE_LINE, /journal/);
    assert.match(FREE_LINE, /reminders/);
    assert.match(FREE_LINE, /nothing you entered is deleted/);
  });

  it('has no exclamation marks', () => {
    for (const line of [...OUTDOORSMAN_FEATURES, ...FAMILY_FEATURES, FREE_LINE]) {
      assert.doesNotMatch(line, /!/);
    }
  });
});

describe('entitlement sync', () => {
  // Regression: the customer-info listener was attached in the same tick as the async
  // configure call, so it attached to nothing and a trial ending went unnoticed.
  it('subscribes only after configure has resolved', async () => {
    const events: string[] = [];
    let configured = false;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));

    startEntitlementSync(
      {
        configure: async () => {
          events.push('configure:start');
          await gate;
          configured = true;
          events.push('configure:done');
        },
        isConfigured: () => configured,
        currentInfo: async () => outdoorsman,
        subscribe: () => {
          events.push(configured ? 'subscribe:configured' : 'subscribe:too-early');
          return () => events.push('unsubscribe');
        },
      },
      (state) => events.push(`state:${state.tier}`)
    );

    assert.deepEqual(events, ['configure:start']);
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(events, [
      'configure:start',
      'configure:done',
      'state:outdoorsman',
      'subscribe:configured',
    ]);
  });

  it('reports free and does not subscribe without a key', async () => {
    const states: string[] = [];
    let subscribed = false;
    startEntitlementSync(
      {
        configure: async () => {},
        isConfigured: () => false,
        currentInfo: async () => null,
        subscribe: () => {
          subscribed = true;
          return () => {};
        },
      },
      (state) => states.push(`${state.tier}:${state.live}`)
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(states, ['free:false']);
    assert.equal(subscribed, false);
  });

  it('cleans up the listener when stopped', async () => {
    let unsubscribed = false;
    const stop = startEntitlementSync(
      {
        configure: async () => {},
        isConfigured: () => true,
        currentInfo: async () => nothing,
        subscribe: () => () => {
          unsubscribed = true;
        },
      },
      () => {}
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    stop();
    assert.equal(unsubscribed, true);
  });
});
