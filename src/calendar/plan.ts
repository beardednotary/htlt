import type { AppData } from '../data/store';
import { seasonTitle, todayISO } from '../model/derive';
import type { ISODate } from '../model/types';

export interface PlannedEvent {
  key: string;
  title: string;
  /** Inclusive calendar days. Everything here is an all-day event. */
  startsOn: ISODate;
  endsOn: ISODate;
  notes?: string;
}

/** Far enough ahead to be useful, not so far that we litter someone's calendar. */
const HORIZON_DAYS = 730;

/**
 * What belongs in a calendar rather than a notification: the things other people
 * need to see. A spouse booking a weekend, or you looking at October before
 * agreeing to a work trip.
 *
 * License expiries are deliberately absent — those are reminders, not plans.
 */
export function planEvents(data: AppData, today: ISODate = todayISO()): PlannedEvent[] {
  const horizon = addDays(today, HORIZON_DAYS);
  const events: PlannedEvent[] = [];

  for (const season of data.seasons) {
    const name = seasonTitle(season);

    for (const window of season.windows) {
      events.push({
        key: `${window.id}-window`,
        title: `${name} · ${window.label}`,
        startsOn: window.opensOn,
        endsOn: window.closesOn,
        notes: season.unit ? `${season.unit} · ${season.year}` : String(season.year),
      });
    }

    const draw = data.drawApplications.find((entry) => entry.seasonId === season.id);
    if (draw?.deadline && (draw.status === 'planning' || draw.status === 'applied')) {
      events.push({
        key: `${draw.id}-deadline`,
        title: `${name} · Application deadline`,
        startsOn: draw.deadline,
        endsOn: draw.deadline,
      });
    }
    if (draw?.resultsOn && draw.status === 'applied') {
      events.push({
        key: `${draw.id}-results`,
        title: `${name} · Draw results`,
        startsOn: draw.resultsOn,
        endsOn: draw.resultsOn,
      });
    }
  }

  for (const trip of data.trips) {
    events.push({
      key: `${trip.id}-trip`,
      title: trip.name,
      startsOn: trip.startsOn,
      endsOn: trip.endsOn,
      notes: trip.locationName,
    });
  }

  return events
    .filter((event) => event.endsOn >= today && event.startsOn <= horizon)
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn));
}

function addDays(iso: ISODate, days: number): ISODate {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
