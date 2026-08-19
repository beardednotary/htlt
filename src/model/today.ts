import type { AppData } from '../data/store';
import { jurisdictionName } from '../data/constants';
import { daysUntil, relativeDays, seasonTitle, todayISO } from './derive';
import type { ISODate } from './types';

export interface TodayItem {
  id: string;
  title: string;
  detail: string;
  /** Sort key. Smaller is more urgent. */
  days: number;
}

/** How far ahead a credential's expiry starts being something you should know about. */
const EXPIRY_HORIZON_DAYS = 60;

export interface TodaySummary {
  comingUp: TodayItem[];
  attention: TodayItem[];
}

/**
 * Everything the Today screen shows is derived from records entered elsewhere.
 * Nothing here is stored, and nothing here asks the hunter to maintain it.
 */
export function summarizeToday(data: AppData, today: ISODate = todayISO()): TodaySummary {
  const comingUp: TodayItem[] = [];
  const attention: TodayItem[] = [];

  for (const season of data.seasons) {
    for (const window of season.windows) {
      const opens = daysUntil(window.opensOn, today);
      const closes = daysUntil(window.closesOn, today);

      if (opens > 0) {
        comingUp.push({
          id: `${window.id}-opens`,
          title: `${seasonTitle(season)} · ${window.label}`,
          detail: `Opens ${relativeDays(opens)}`,
          days: opens,
        });
      } else if (closes >= 0) {
        comingUp.push({
          id: `${window.id}-open`,
          title: `${seasonTitle(season)} · ${window.label}`,
          detail: closes === 0 ? 'Closes today' : `Open now · closes ${relativeDays(closes)}`,
          days: -1,
        });
      }
    }
  }

  for (const credential of data.credentials) {
    if (!credential.validUntil) continue;
    const days = daysUntil(credential.validUntil, today);
    if (days < 0) {
      attention.push({
        id: `${credential.id}-expired`,
        title: credential.name,
        detail: `Expired ${relativeDays(days)}`,
        days,
      });
    } else if (days <= EXPIRY_HORIZON_DAYS) {
      attention.push({
        id: `${credential.id}-expiring`,
        title: credential.name,
        detail: days === 0 ? 'Expires today' : `Expires ${relativeDays(days)}`,
        days,
      });
    }
  }

  for (const application of data.drawApplications) {
    if (!application.deadline) continue;
    if (application.status !== 'planning' && application.status !== 'applied') continue;
    const days = daysUntil(application.deadline, today);
    if (days < 0) continue;
    const season = data.seasons.find((s) => s.id === application.seasonId);
    comingUp.push({
      id: `${application.id}-deadline`,
      title: season ? seasonTitle(season) : jurisdictionName(''),
      detail: `Application due ${relativeDays(days)}`,
      days,
    });
  }

  comingUp.sort((a, b) => a.days - b.days);
  attention.sort((a, b) => a.days - b.days);
  return { comingUp, attention };
}
