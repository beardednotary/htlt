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

/** Regulations only nag once a season is close enough for them to matter. */
const REVIEW_LOOKAHEAD_DAYS = 45;

/** Agencies reissue regulations annually; half a year old is stale enough to reread. */
const REVIEW_STALE_DAYS = 180;

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

  for (const season of data.seasons) {
    const regulations = data.regulations.filter((r) => season.regulationIds.includes(r.id));
    if (regulations.length === 0) continue;

    // How soon this season matters: days to the next opener, or zero if it is open now.
    const proximity = season.windows.reduce((nearest, window) => {
      const opens = daysUntil(window.opensOn, today);
      const closes = daysUntil(window.closesOn, today);
      if (opens > 0) return Math.min(nearest, opens);
      if (closes >= 0) return 0;
      return nearest;
    }, Number.POSITIVE_INFINITY);

    if (proximity > REVIEW_LOOKAHEAD_DAYS) continue;

    for (const regulation of regulations) {
      if (!regulation.lastReviewedOn) {
        attention.push({
          id: `${regulation.id}-unreviewed`,
          title: seasonTitle(season),
          detail: 'Regulations not reviewed',
          days: proximity,
        });
      } else if (-daysUntil(regulation.lastReviewedOn, today) > REVIEW_STALE_DAYS) {
        attention.push({
          id: `${regulation.id}-stale`,
          title: seasonTitle(season),
          detail: `Regulations ${relativeDays(daysUntil(regulation.lastReviewedOn, today))
            .replace('days ago', 'days old')}`,
          days: proximity,
        });
      }
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
