import type { AppData } from '../data/store';
import { formatShortDate, seasonTitle } from './derive';
import type { ISODate, Trip } from './types';

export interface PersonReadiness {
  personId: string;
  name: string;
  ready: boolean;
  /** Plain sentences, in the order a person would want to hear them. */
  issues: string[];
}

export interface TripReadiness {
  people: PersonReadiness[];
  ready: number;
  total: number;
  /** True when nothing can be checked, so the UI can say why rather than claim success. */
  unknowable: boolean;
}

/**
 * The question this whole tier exists to answer: who is ready, and who is not.
 *
 * Checked against the trip's own dates rather than today, because a license that is
 * valid this morning and expires the day before the opener is the exact failure the
 * app is supposed to catch — on a Tuesday, not on the Friday you are loading the truck.
 */
export function tripReadiness(data: AppData, trip: Trip): TripReadiness {
  const seasons = data.seasons.filter((season) => trip.seasonIds.includes(season.id));
  const people = data.people.filter((person) => trip.participantIds.includes(person.id));

  const readiness = people.map((person) => {
    const issues: string[] = [];

    for (const season of seasons) {
      const theirs = data.credentials.filter(
        (credential) =>
          credential.personId === person.id && season.credentialIds.includes(credential.id)
      );

      if (theirs.length === 0) {
        issues.push(`No license or tag on file for ${seasonTitle(season)}`);
        continue;
      }

      for (const credential of theirs) {
        if (expiresBefore(credential.validUntil, trip.endsOn)) {
          issues.push(
            `${credential.name} expires ${formatShortDate(credential.validUntil as ISODate)}, before the trip ends`
          );
        }
      }
    }

    return { personId: person.id, name: person.name, ready: issues.length === 0, issues };
  });

  return {
    people: readiness,
    ready: readiness.filter((person) => person.ready).length,
    total: readiness.length,
    unknowable: seasons.length === 0 || people.length === 0,
  };
}

function expiresBefore(validUntil: ISODate | undefined, date: ISODate): boolean {
  if (!validUntil) return false;
  return validUntil < date;
}

/** Trips that have not finished, soonest first. */
export function upcomingTrips(data: AppData, today: ISODate): Trip[] {
  return data.trips
    .filter((trip) => trip.endsOn >= today)
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn));
}
