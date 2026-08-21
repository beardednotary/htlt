import type { AppData } from '../data/store';
import type { ISODate } from '../model/types';
import { planEvents } from './plan';

/**
 * One-way export into a calendar this app creates and owns.
 *
 * Never writes to a personal or shared calendar. Everything lives in "Hunting
 * Seasons", which means cleanup is one deletion and a full rebuild can never
 * clobber something a person put there themselves. Two-way sync is deliberately
 * not attempted: it would make us the source of truth for someone's calendar and
 * buy nothing but conflict resolution.
 *
 * expo-calendar is native, so it is required lazily — a development build made
 * before it was added must degrade rather than crash on import.
 */

const CALENDAR_TITLE = 'Hunting Seasons';

type CalendarModule = typeof import('expo-calendar');

let cached: CalendarModule | null | undefined;

function calendarModule(): CalendarModule | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-calendar') as CalendarModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function calendarAvailable(): boolean {
  return calendarModule() !== null;
}

export async function requestCalendarAccess(): Promise<boolean> {
  const Calendar = calendarModule();
  if (!Calendar) return false;
  try {
    const { granted } = await Calendar.requestCalendarPermissions();
    return granted;
  } catch {
    return false;
  }
}

async function findOrCreateCalendar(existingId?: string) {
  const Calendar = calendarModule();
  if (!Calendar) return null;

  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);

  if (existingId) {
    const known = calendars.find((entry) => entry.id === existingId);
    if (known) return known;
  }

  const byTitle = calendars.find((entry) => entry.title === CALENDAR_TITLE);
  if (byTitle) return byTitle;

  const source = Calendar.getDefaultCalendarSync()?.source;
  return Calendar.createCalendar({
    title: CALENDAR_TITLE,
    color: '#4C6B4F',
    entityType: Calendar.EntityTypes.EVENT,
    source,
    sourceId: source?.id,
    name: CALENDAR_TITLE,
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

function startOfDay(iso: ISODate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
}

function endOfDay(iso: ISODate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 0);
}

export interface SyncResult {
  calendarId: string;
  events: number;
}

/**
 * Rebuilds the calendar's contents from the records, the same way reminders are
 * rebuilt. Diffing would be cheaper and would eventually leave a stale opener
 * behind on a season somebody deleted.
 */
export async function syncCalendar(
  data: AppData,
  existingId?: string
): Promise<SyncResult | null> {
  const Calendar = calendarModule();
  if (!Calendar) return null;

  const calendar = await findOrCreateCalendar(existingId);
  if (!calendar) return null;

  const planned = planEvents(data);

  // Clear a generous window either side, so events that moved are not orphaned.
  const from = new Date();
  from.setFullYear(from.getFullYear() - 2);
  const to = new Date();
  to.setFullYear(to.getFullYear() + 3);

  const existing = await Calendar.listEvents([calendar], from, to);
  for (const event of existing) {
    await event.delete();
  }

  for (const event of planned) {
    await calendar.createEvent({
      title: event.title,
      startDate: startOfDay(event.startsOn),
      endDate: endOfDay(event.endsOn),
      allDay: true,
      notes: event.notes,
    });
  }

  return { calendarId: calendar.id, events: planned.length };
}

/** Removing the calendar takes every event we ever wrote with it. */
export async function removeCalendar(calendarId: string): Promise<void> {
  const Calendar = calendarModule();
  if (!Calendar) return;
  try {
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    const ours = calendars.find((entry) => entry.id === calendarId);
    await ours?.delete();
  } catch {
    // Already gone, or the user deleted it themselves. Either way, done.
  }
}
