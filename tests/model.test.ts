/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AppData } from '../src/data/store';
import { tripReadiness } from '../src/model/readiness';
import { defaultJurisdictionId } from '../src/model/seasonDefaults';
import type { Credential, Season, Trip } from '../src/model/types';
import { canAddCredential, credentialAllowance } from '../src/purchases/limits';
import { afterAccomplishment, ASK_AFTER_ACCOMPLISHMENTS } from '../src/review/policy';

function household(overrides: Partial<AppData> = {}): AppData {
  return {
    schemaVersion: 1,
    householdId: 'hh',
    settings: { remindersEnabled: false },
    people: [{ id: 'p1', householdId: 'hh', name: 'Sam', accountId: null }],
    credentials: [],
    seasons: [],
    drawApplications: [],
    regulations: [],
    gear: [],
    trips: [],
    activities: [],
    harvests: [],
    catches: [],
    documents: [],
    milestones: [],
    ...overrides,
  } as AppData;
}

function credential(id: string, validUntil?: string): Credential {
  return {
    id,
    personId: 'p1',
    kind: 'tag',
    name: `Tag ${id}`,
    jurisdictionId: 'us-co',
    validUntil,
  } as Credential;
}

function season(id: string, jurisdictionId: string, credentialIds: string[] = []): Season {
  return {
    id,
    householdId: 'hh',
    pursuit: 'hunting',
    species: 'Moose',
    jurisdictionId,
    year: 2026,
    methods: ['rifle'],
    windows: [],
    credentialIds,
    regulationIds: [],
    participantIds: ['p1'],
  } as unknown as Season;
}

describe('credential allowance', () => {
  it('counts only active credentials', () => {
    const data = household({
      credentials: [credential('a', '2099-12-31'), credential('b', '2000-01-01')],
    });
    assert.equal(credentialAllowance(data, 'free'), 'Free keeps 3 active at a time, and expired ones do not count. 1 of 3 in use.');
    assert.equal(canAddCredential(data, 'free').allowed, true);
  });

  it('says so before the form when the limit is reached', () => {
    const data = household({
      credentials: ['a', 'b', 'c'].map((id) => credential(id, '2099-12-31')),
    });
    assert.match(credentialAllowance(data, 'free') ?? '', /All 3 are in use/);
    assert.equal(canAddCredential(data, 'free').allowed, false);
  });

  it('says nothing to paying customers', () => {
    assert.equal(credentialAllowance(household(), 'outdoorsman'), null);
  });

  // Fixed copy must not contradict a sheet titled "Licence or Tag" for an Ontario
  // season, so it avoids the word entirely.
  it('never uses either spelling of license', () => {
    const line = credentialAllowance(household(), 'free') ?? '';
    assert.doesNotMatch(line, /licen[cs]e/i);
  });
});

describe('trip readiness wording', () => {
  const trip = {
    id: 't1',
    name: 'Moose camp',
    startsOn: '2026-09-20',
    endsOn: '2026-09-27',
    seasonIds: ['s1'],
    participantIds: ['p1'],
  } as unknown as Trip;

  // Regression: an Ontario season said "license", the one word the app promises to
  // spell the way the jurisdiction does.
  it('uses licence for a Canadian season', () => {
    const data = household({ seasons: [season('s1', 'ca-on')], trips: [trip] });
    assert.match(tripReadiness(data, trip).people[0]!.issues[0]!, /^No licence or tag on file for /);
  });

  it('uses license for an American season', () => {
    const data = household({ seasons: [season('s1', 'us-co')], trips: [trip] });
    assert.match(tripReadiness(data, trip).people[0]!.issues[0]!, /^No license or tag on file for /);
  });
});

describe('new season default jurisdiction', () => {
  it('follows the last season entered', () => {
    assert.equal(defaultJurisdictionId([{ jurisdictionId: 'us-co' }, { jurisdictionId: 'us-wy' }], 'US'), 'us-wy');
  });

  // Regression: a Canadian's first form opened on California.
  it('starts a Canadian phone in Canada', () => {
    assert.equal(defaultJurisdictionId([], 'CA'), 'ca-on');
  });

  it('falls back to California otherwise', () => {
    assert.equal(defaultJurisdictionId([], 'US'), 'us-ca');
    assert.equal(defaultJurisdictionId([], undefined), 'us-ca');
  });
});

describe('review prompt policy', () => {
  it(`asks on the ${ASK_AFTER_ACCOMPLISHMENTS}rd accomplishment, not before`, () => {
    let state = undefined as ReturnType<typeof afterAccomplishment>['next'] | undefined;
    const asks: boolean[] = [];
    for (let i = 0; i < ASK_AFTER_ACCOMPLISHMENTS; i += 1) {
      const result = afterAccomplishment(state, '2026-11-21');
      asks.push(result.ask);
      state = result.next;
    }
    assert.deepEqual(asks, [false, false, true]);
    assert.equal(state?.lastAskedOn, '2026-11-21');
  });

  it('does not ask again within the same season', () => {
    let state = { accomplishments: 0, lastAskedOn: '2026-11-21' };
    for (let i = 0; i < 10; i += 1) {
      const result = afterAccomplishment(state, '2027-01-15');
      assert.equal(result.ask, false);
      state = result.next as typeof state;
    }
  });

  it('asks again once enough time and use have passed', () => {
    const result = afterAccomplishment({ accomplishments: 5, lastAskedOn: '2026-01-01' }, '2026-06-01');
    assert.equal(result.ask, true);
  });
});
