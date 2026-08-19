import { jurisdictionName, METHOD_LABELS } from '../data/constants';
import type { ISODate, Season } from './types';

export type SeasonPhase = 'active' | 'upcoming' | 'past';

export function todayISO(now: Date = new Date()): ISODate {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Derived from the season's dates, never stored. A season with no dates yet is
 * upcoming — someone entered it precisely because it hasn't happened.
 */
export function seasonPhase(season: Season, today: ISODate = todayISO()): SeasonPhase {
  if (season.windows.length === 0) return 'upcoming';
  if (season.windows.some((w) => w.opensOn <= today && today <= w.closesOn)) return 'active';
  if (season.windows.some((w) => w.opensOn > today)) return 'upcoming';
  return 'past';
}

/** "California Deer" — the line a hunter would say out loud. */
export function seasonTitle(season: Season): string {
  const place = jurisdictionName(season.jurisdictionId);
  const species = season.species ?? (season.pursuit === 'fishing' ? 'Fishing' : 'Hunting');
  return `${place} ${species}`;
}

/** "A Zone · Rifle, Archery · 2027" */
export function seasonSubtitle(season: Season): string {
  const parts: string[] = [];
  if (season.unit) parts.push(season.unit);
  if (season.methods.length > 0) {
    parts.push(season.methods.map((m) => METHOD_LABELS[m]).join(', '));
  }
  parts.push(`${season.year}`);
  return parts.join(' · ');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Aug 8" — year is dropped because the season already carries it. */
export function formatShortDate(iso: ISODate): string {
  const [, month, day] = iso.split('-');
  const monthIndex = Number(month) - 1;
  if (Number.isNaN(monthIndex) || !MONTHS[monthIndex]) return iso;
  return `${MONTHS[monthIndex]} ${Number(day)}`;
}

export function seasonDatesLine(season: Season): string {
  if (season.windows.length === 0) return 'No dates yet';
  return season.windows
    .map((w) => `${w.label}  ${formatShortDate(w.opensOn)} – ${formatShortDate(w.closesOn)}`)
    .join('\n');
}

function toUTC(iso: ISODate): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
}

/** Whole days from today to the given date. Negative once it has passed. */
export function daysUntil(iso: ISODate, today: ISODate = todayISO()): number {
  return Math.round((toUTC(iso) - toUTC(today)) / 86_400_000);
}

/** "in 18 days", "tomorrow", "today", "3 days ago" — the way a person says it. */
export function relativeDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** "Reviewed today", "Reviewed 12 days ago", or an honest admission that nobody has. */
export function reviewedLine(lastReviewedOn: ISODate | undefined, today: ISODate = todayISO()): string {
  if (!lastReviewedOn) return 'Never reviewed';
  const days = daysUntil(lastReviewedOn, today);
  if (days === 0) return 'Reviewed today';
  return `Reviewed ${relativeDays(days)}`;
}
