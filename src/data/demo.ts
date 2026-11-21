import { newId } from './ids';
import { replaceAllData, type AppData } from './store';
import { todayISO } from '../model/derive';
import type { ISODate } from '../model/types';

/**
 * A household that looks like a real one, for App Store screenshots.
 *
 * Every date is relative to today, so Today and the trip readiness check are always
 * mid-season no matter when the screenshots are taken. Nothing here ships — it is
 * reachable only from Settings in a development build.
 */

function shift(days: number): ISODate {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return todayISO(now);
}

/** Same month and day, a given number of years back. */
function yearsAgo(years: number, month: number, day: number): ISODate {
  const year = new Date().getFullYear() - years;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function buildDemoData(): AppData {
  const householdId = newId('hh');
  const thisYear = new Date().getFullYear();

  const ray = { id: newId('person'), householdId, name: 'Ray', accountId: null };
  const ethan = {
    id: newId('person'),
    householdId,
    name: 'Ethan',
    accountId: null,
    birthYear: thisYear - 14,
  };
  const jim = {
    id: newId('person'),
    householdId,
    name: 'Jim',
    accountId: null,
    birthYear: 1951,
    huntingSince: 1963,
  };

  // Credentials. Jim's lapses mid-trip, which is the whole point of the readiness check.
  const caLicense = {
    id: newId('cred'),
    personId: ray.id,
    kind: 'license' as const,
    name: 'California Hunting License',
    jurisdictionId: 'us-ca',
    number: 'K4429181',
    year: thisYear,
    validUntil: `${thisYear}-12-31` as ISODate,
    documentIds: [],
  };
  const deerTag = {
    id: newId('cred'),
    personId: ray.id,
    kind: 'tag' as const,
    name: 'A Zone Deer Tag',
    jurisdictionId: 'us-ca',
    number: 'A-118240',
    year: thisYear,
    validUntil: shift(46),
    documentIds: [],
  };
  const duckStamp = {
    id: newId('cred'),
    personId: ray.id,
    kind: 'validation' as const,
    name: 'Federal Duck Stamp',
    jurisdictionId: 'us-federal',
    year: thisYear,
    validUntil: `${thisYear + 1}-06-30` as ISODate,
    documentIds: [],
  };
  const coElkTag = {
    id: newId('cred'),
    personId: ray.id,
    kind: 'tag' as const,
    name: 'Colorado OTC Elk Tag',
    jurisdictionId: 'us-co',
    number: 'EE003-O1-R',
    year: thisYear,
    validUntil: shift(74),
    documentIds: [],
  };
  const ethanLicense = {
    id: newId('cred'),
    personId: ethan.id,
    kind: 'license' as const,
    name: 'Junior Hunting License',
    jurisdictionId: 'us-ca',
    year: thisYear,
    validUntil: `${thisYear}-12-31` as ISODate,
    documentIds: [],
  };
  const ethanDeerTag = {
    id: newId('cred'),
    personId: ethan.id,
    kind: 'tag' as const,
    name: 'Junior Deer Tag',
    jurisdictionId: 'us-ca',
    year: thisYear,
    validUntil: shift(46),
    documentIds: [],
  };
  const jimLicense = {
    id: newId('cred'),
    personId: jim.id,
    kind: 'license' as const,
    name: 'California Hunting License',
    jurisdictionId: 'us-ca',
    year: thisYear,
    validUntil: shift(16),
    documentIds: [],
  };

  const cdfwRegs = {
    id: newId('reg'),
    jurisdictionId: 'us-ca',
    title: `${thisYear} Mammal Hunting Regulations`,
    url: 'https://wildlife.ca.gov/Regulations',
    documentIds: [],
    notes: 'Nonlead ammunition required statewide. Check shooting hours before the opener.',
    lastReviewedOn: shift(-9),
  };
  const cpwRegs = {
    id: newId('reg'),
    jurisdictionId: 'us-co',
    title: `${thisYear} Big Game Brochure`,
    url: 'https://cpw.state.co.us',
    documentIds: [],
  };

  const caDeer = {
    id: newId('season'),
    householdId,
    pursuit: 'hunting' as const,
    species: 'Deer',
    jurisdictionId: 'us-ca',
    unit: 'A Zone',
    year: thisYear,
    status: 'active' as const,
    windows: [
      { id: newId('win'), label: 'Archery', method: 'compoundBow' as const, opensOn: shift(-38), closesOn: shift(-16) },
      { id: newId('win'), label: 'Rifle', method: 'rifle' as const, opensOn: shift(18), closesOn: shift(46) },
    ],
    methods: ['compoundBow' as const, 'rifle' as const],
    credentialIds: [caLicense.id, deerTag.id, ethanLicense.id, ethanDeerTag.id, jimLicense.id],
    regulationIds: [cdfwRegs.id],
    participantIds: [ray.id, ethan.id, jim.id],
  };

  const coElk = {
    id: newId('season'),
    householdId,
    pursuit: 'hunting' as const,
    species: 'Elk',
    jurisdictionId: 'us-co',
    unit: 'Unit 61',
    year: thisYear,
    status: 'planning' as const,
    windows: [
      { id: newId('win'), label: 'Rifle', method: 'rifle' as const, opensOn: shift(53), closesOn: shift(61) },
    ],
    methods: ['rifle' as const],
    credentialIds: [coElkTag.id],
    regulationIds: [cpwRegs.id],
    participantIds: [ray.id],
  };

  const azElk = {
    id: newId('season'),
    householdId,
    pursuit: 'hunting' as const,
    species: 'Elk',
    jurisdictionId: 'us-az',
    year: thisYear + 1,
    status: 'planning' as const,
    windows: [],
    methods: ['rifle' as const],
    credentialIds: [],
    regulationIds: [],
    participantIds: [ray.id],
  };

  const caWaterfowl = {
    id: newId('season'),
    householdId,
    pursuit: 'hunting' as const,
    species: 'Duck',
    jurisdictionId: 'us-ca',
    year: thisYear,
    status: 'planning' as const,
    windows: [
      { id: newId('win'), label: 'Shotgun', method: 'shotgun' as const, opensOn: shift(72), closesOn: shift(160) },
    ],
    methods: ['shotgun' as const],
    credentialIds: [caLicense.id, duckStamp.id],
    regulationIds: [],
    participantIds: [ray.id, ethan.id],
  };

  const azDraw = {
    id: newId('draw'),
    seasonId: azElk.id,
    personId: ray.id,
    status: 'applied' as const,
    opensOn: shift(-24),
    deadline: shift(6),
    resultsOn: shift(88),
    preferencePoints: 4,
    notes: 'Unit 9 first choice, Unit 10 second. Party application with Dad.',
  };

  const openingWeekend = {
    id: newId('trip'),
    householdId,
    name: 'Opening Weekend',
    startsOn: shift(18),
    endsOn: shift(20),
    locationName: 'Mendocino County',
    participantIds: [ray.id, ethan.id, jim.id],
    seasonIds: [caDeer.id],
  };

  // A season that reads honestly: six hunts, one harvest, plenty of blank days.
  const days: { at: number; pursuit: 'hunting' | 'fishing'; where: string; season?: string; method?: 'rifle' | 'compoundBow' | 'shotgun'; notes?: string }[] = [
    { at: -38, pursuit: 'hunting', where: 'Cache Creek', season: caDeer.id, method: 'compoundBow', notes: 'Two does at 60 yards, never closed the distance.' },
    { at: -34, pursuit: 'hunting', where: 'Cache Creek', season: caDeer.id, method: 'compoundBow' },
    { at: -31, pursuit: 'fishing', where: 'Putah Creek', notes: 'Water low and clear. Six on a size 18 midge.' },
    { at: -27, pursuit: 'hunting', where: 'Cache Creek', season: caDeer.id, method: 'compoundBow', notes: 'Buck at first light. Long pack out.' },
    { at: -21, pursuit: 'fishing', where: 'Crowley Lake', notes: 'Ethan out-fished me three to one.' },
    { at: -17, pursuit: 'hunting', where: 'Cache Creek', season: caDeer.id, method: 'compoundBow' },
    { at: -12, pursuit: 'hunting', where: 'Mendocino County', season: caDeer.id, method: 'rifle', notes: 'Rain all morning. Saw nothing worth the walk.' },
    { at: -6, pursuit: 'fishing', where: 'Convict Lake' },
  ];

  const activities = days.map((day) => ({
    id: newId('act'),
    householdId,
    seasonId: day.season,
    pursuit: day.pursuit,
    date: shift(day.at),
    locationName: day.where,
    participantIds: day.at % 3 === 0 ? [ray.id, ethan.id] : [ray.id],
    methodOfTake: day.method,
    technique: day.pursuit === 'fishing' ? ('fly' as const) : undefined,
    gearIds: [],
    documentIds: [],
    notes: day.notes,
  }));

  const harvests = [
    {
      id: newId('harvest'),
      activityId: activities[3].id,
      species: 'Deer',
      sex: 'male' as const,
      points: 3,
      credentialId: deerTag.id,
      documentIds: [],
      notes: 'First archery buck. Ethan packed the front quarters out.',
    },
  ];

  const catches = [
    { id: newId('catch'), activityId: activities[2].id, species: 'Rainbow Trout', quantity: 6, kept: false, gearIds: [], documentIds: [] },
    { id: newId('catch'), activityId: activities[4].id, species: 'Brown Trout', quantity: 3, kept: false, gearIds: [], documentIds: [] },
    { id: newId('catch'), activityId: activities[7].id, species: 'Rainbow Trout', quantity: 4, kept: true, gearIds: [], documentIds: [] },
  ];

  const milestones = [
    {
      id: newId('milestone'),
      personId: jim.id,
      title: 'First deer',
      date: yearsAgo(61, 10, 14),
      documentIds: [],
    },
  ];

  return {
    schemaVersion: 1,
    householdId,
    settings: { remindersEnabled: true, welcomeSeen: true },
    people: [ray, ethan, jim],
    credentials: [caLicense, deerTag, duckStamp, coElkTag, ethanLicense, ethanDeerTag, jimLicense],
    seasons: [caDeer, coElk, azElk, caWaterfowl],
    drawApplications: [azDraw],
    regulations: [cdfwRegs, cpwRegs],
    gear: [],
    trips: [openingWeekend],
    activities,
    harvests,
    catches,
    documents: [],
    milestones,
  };
}

export function loadDemoData() {
  replaceAllData(buildDemoData());
}
