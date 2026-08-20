import type { AppData } from '../data/store';
import { credentialStatus, seasonTitle } from '../model/derive';
import type { ISODate } from '../model/types';

export interface PlannedReminder {
  /** Stable across replans, so the same reminder is recognisable in logs. */
  key: string;
  title: string;
  body: string;
  fireAt: Date;
}

/** Reminders land mid-morning. Nobody needs to hear about a tag at 3am. */
const HOUR = 9;

const OPENER_LEAD_DAYS = [7, 1];
const EXPIRY_LEAD_DAYS = [30, 7];
const DEADLINE_LEAD_DAYS = [30, 7, 1];
const REVIEW_LEAD_DAYS = 14;

/**
 * iOS keeps at most 64 pending local notifications per app and silently drops the
 * rest, so the plan is trimmed to the soonest ones rather than left to chance.
 */
export const IOS_PENDING_LIMIT = 64;

function at(iso: ISODate, daysBefore: number): Date {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1, HOUR, 0, 0, 0);
  date.setDate(date.getDate() - daysBefore);
  return date;
}

function plural(days: number): string {
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * Every reminder is derived from records the hunter already keeps. Nothing here is
 * a separate thing to maintain, which is the whole point — you should not have to
 * remember to be reminded.
 */
export function planReminders(data: AppData, now: Date = new Date()): PlannedReminder[] {
  const planned: PlannedReminder[] = [];

  for (const season of data.seasons) {
    const name = seasonTitle(season);

    for (const window of season.windows) {
      for (const lead of OPENER_LEAD_DAYS) {
        planned.push({
          key: `${window.id}-opens-${lead}`,
          title: `${name} · ${window.label}`,
          body: `Opens ${plural(lead)}.`,
          fireAt: at(window.opensOn, lead),
        });
      }
      planned.push({
        key: `${window.id}-closes-1`,
        title: `${name} · ${window.label}`,
        body: 'Last day tomorrow.',
        fireAt: at(window.closesOn, 1),
      });
    }

    // Read the regulations before the opener, not after something goes wrong.
    const regulations = data.regulations.filter((r) => season.regulationIds.includes(r.id));
    const firstOpener = [...season.windows].sort((a, b) => a.opensOn.localeCompare(b.opensOn))[0];
    if (firstOpener) {
      for (const regulation of regulations) {
        planned.push({
          key: `${regulation.id}-review`,
          title: name,
          body: `Review the ${regulation.title} before the opener.`,
          fireAt: at(firstOpener.opensOn, REVIEW_LEAD_DAYS),
        });
      }
    }
  }

  for (const credential of data.credentials) {
    if (!credential.validUntil) continue;
    if (credentialStatus(credential.validUntil) === 'expired') continue;
    const holder = data.people.find((person) => person.id === credential.personId);
    for (const lead of EXPIRY_LEAD_DAYS) {
      planned.push({
        key: `${credential.id}-expires-${lead}`,
        title: holder ? `${holder.name} · ${credential.name}` : credential.name,
        body: `Expires ${plural(lead)}.`,
        fireAt: at(credential.validUntil, lead),
      });
    }
  }

  for (const application of data.drawApplications) {
    if (!application.deadline) continue;
    if (application.status !== 'planning' && application.status !== 'applied') continue;
    const season = data.seasons.find((s) => s.id === application.seasonId);
    for (const lead of DEADLINE_LEAD_DAYS) {
      planned.push({
        key: `${application.id}-deadline-${lead}`,
        title: season ? seasonTitle(season) : 'Draw application',
        body: `Application deadline ${plural(lead)}.`,
        fireAt: at(application.deadline, lead),
      });
    }
  }

  return planned
    .filter((reminder) => reminder.fireAt.getTime() > now.getTime())
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, IOS_PENDING_LIMIT);
}
