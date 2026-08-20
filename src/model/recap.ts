import { METHOD_LABELS, jurisdictionName } from '../data/constants';
import type { AppData } from '../data/store';
import type { Activity, ID } from './types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface Tally {
  label: string;
  count: number;
}

export interface First {
  /** "First elk", "First brown trout" — the line that makes a year memorable. */
  label: string;
  date: string;
  activityId?: ID;
}

export interface YearRecap {
  year: number;
  daysAfield: number;
  hunts: number;
  fishingTrips: number;
  harvests: number;
  fish: number;
  /** Hunts that ended with nothing taken. Kept deliberately — most of them do. */
  blankHunts: number;
  places: string[];
  species: Tally[];
  methods: Tally[];
  companions: Tally[];
  busiestMonth?: string;
  firsts: First[];
  /** A photo from the year, for the screen that wants one. */
  heroPhotoUri?: string;
  isEmpty: boolean;
}

function yearOf(iso: string): number {
  return Number(iso.slice(0, 4));
}

function tally(counts: Map<string, number>): Tally[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Years that actually have something in them, newest first. */
export function yearsWithActivity(data: AppData): number[] {
  const years = new Set<number>();
  for (const activity of data.activities) years.add(yearOf(activity.date));
  for (const season of data.seasons) {
    if (season.windows.length > 0) years.add(season.year);
  }
  return [...years].sort((a, b) => b - a);
}

/**
 * Everything the recap says is counted from records the hunter already kept. It is
 * deliberately honest: blank hunts are reported alongside harvests, because a year
 * that only celebrates success is worthless as an archive.
 */
export function summarizeYear(data: AppData, year: number): YearRecap {
  const activities = data.activities.filter((activity) => yearOf(activity.date) === year);
  const activityIds = new Set(activities.map((activity) => activity.id));

  const harvests = data.harvests.filter((harvest) => activityIds.has(harvest.activityId));
  const catches = data.catches.filter((entry) => activityIds.has(entry.activityId));

  const days = new Set(activities.map((activity) => activity.date));
  const hunts = activities.filter((activity) => activity.pursuit === 'hunting');
  const fishingTrips = activities.filter((activity) => activity.pursuit === 'fishing');

  const huntsWithHarvest = new Set(harvests.map((harvest) => harvest.activityId));
  const blankHunts = hunts.filter((hunt) => !huntsWithHarvest.has(hunt.id)).length;

  const placeIds = new Set<ID>();
  for (const activity of activities) {
    const season = data.seasons.find((s) => s.id === activity.seasonId);
    if (season) placeIds.add(season.jurisdictionId);
  }

  const speciesCounts = new Map<string, number>();
  for (const harvest of harvests) {
    speciesCounts.set(harvest.species, (speciesCounts.get(harvest.species) ?? 0) + 1);
  }
  for (const entry of catches) {
    speciesCounts.set(entry.species, (speciesCounts.get(entry.species) ?? 0) + entry.quantity);
  }

  const methodCounts = new Map<string, number>();
  for (const activity of hunts) {
    if (!activity.methodOfTake) continue;
    const label = METHOD_LABELS[activity.methodOfTake];
    methodCounts.set(label, (methodCounts.get(label) ?? 0) + 1);
  }

  const companionCounts = new Map<string, number>();
  for (const activity of activities) {
    for (const personId of activity.participantIds) {
      const person = data.people.find((entry) => entry.id === personId);
      if (!person) continue;
      companionCounts.set(person.name, (companionCounts.get(person.name) ?? 0) + 1);
    }
  }

  const monthCounts = new Map<number, number>();
  for (const date of days) {
    const month = Number(date.slice(5, 7)) - 1;
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  const busiest = [...monthCounts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];

  return {
    year,
    daysAfield: days.size,
    hunts: hunts.length,
    fishingTrips: fishingTrips.length,
    harvests: harvests.length,
    fish: catches.reduce((sum, entry) => sum + entry.quantity, 0),
    blankHunts,
    places: [...placeIds].map(jurisdictionName).sort(),
    species: tally(speciesCounts),
    methods: tally(methodCounts),
    companions: tally(companionCounts),
    busiestMonth: busiest ? MONTHS[busiest[0]] : undefined,
    firsts: findFirsts(data, activities, year),
    heroPhotoUri: findHeroPhoto(data, activities),
    isEmpty: activities.length === 0,
  };
}

/**
 * A species counts as a first only if the household has never recorded it before —
 * in any earlier year, by anyone. That is what makes "first elk" mean something.
 */
function findFirsts(data: AppData, activities: Activity[], year: number): First[] {
  const dateOf = new Map(data.activities.map((activity) => [activity.id, activity.date]));

  const earlier = new Set<string>();
  const thisYear = new Map<string, string>();

  const record = (species: string, activityId: ID) => {
    const date = dateOf.get(activityId);
    if (!date) return;
    const key = species.toLowerCase();
    if (yearOf(date) < year) {
      earlier.add(key);
      return;
    }
    if (yearOf(date) !== year) return;
    const existing = thisYear.get(key);
    if (!existing || date < existing) thisYear.set(key, date);
  };

  for (const harvest of data.harvests) record(harvest.species, harvest.activityId);
  for (const entry of data.catches) record(entry.species, entry.activityId);

  const names = new Map<string, string>();
  for (const harvest of data.harvests) names.set(harvest.species.toLowerCase(), harvest.species);
  for (const entry of data.catches) names.set(entry.species.toLowerCase(), entry.species);

  const activityIds = new Set(activities.map((activity) => activity.id));

  return [...thisYear.entries()]
    .filter(([key]) => !earlier.has(key))
    .map(([key, date]) => {
      const owner = [...data.harvests, ...data.catches].find(
        (record) =>
          record.species.toLowerCase() === key &&
          activityIds.has(record.activityId) &&
          dateOf.get(record.activityId) === date
      );
      return {
        label: `First ${names.get(key) ?? key}`,
        date,
        activityId: owner?.activityId,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function findHeroPhoto(data: AppData, activities: Activity[]): string | undefined {
  const activityIds = new Set(activities.map((activity) => activity.id));
  const harvestPhotoIds = data.harvests
    .filter((harvest) => activityIds.has(harvest.activityId))
    .flatMap((harvest) => harvest.documentIds);

  // A harvest photo first, then any photo from the year.
  const candidates = [
    ...harvestPhotoIds,
    ...activities.flatMap((activity) => activity.documentIds),
  ];

  for (const id of candidates) {
    const document = data.documents.find((entry) => entry.id === id && entry.kind === 'photo');
    if (document) return document.uri;
  }
  return undefined;
}
