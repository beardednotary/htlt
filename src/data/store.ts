import { useSyncExternalStore } from 'react';

import type {
  Activity,
  Catch,
  Credential,
  DocumentRef,
  DrawApplication,
  Gear,
  Harvest,
  ID,
  ISODate,
  MethodOfTake,
  Milestone,
  Person,
  RegulationRef,
  Season,
  Trip,
} from '../model/types';
import { newId } from './ids';
import { readItem, writeItem } from './storage';

const KEY = 'htlt.data.v1';
const SCHEMA_VERSION = 1;

/**
 * Everything a household owns, held in memory and written out as one document.
 * A household's records number in the hundreds, so the relational model is enforced
 * by the types rather than by a query engine. If that ever stops being true, this is
 * the single place that has to change.
 */
export interface AppData {
  schemaVersion: number;
  householdId: ID;
  people: Person[];
  credentials: Credential[];
  seasons: Season[];
  drawApplications: DrawApplication[];
  regulations: RegulationRef[];
  gear: Gear[];
  trips: Trip[];
  activities: Activity[];
  harvests: Harvest[];
  catches: Catch[];
  documents: DocumentRef[];
  milestones: Milestone[];
}

function emptyData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    householdId: newId('hh'),
    people: [],
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
  };
}

export interface StoreState {
  loaded: boolean;
  data: AppData;
}

let state: StoreState = { loaded: false, data: emptyData() };
const listeners = new Set<() => void>();

function emit(next: StoreState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

let loading: Promise<void> | null = null;

export function loadStore(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    const raw = await readItem(KEY);
    let data = emptyData();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AppData>;
        data = { ...data, ...parsed, schemaVersion: SCHEMA_VERSION };
      } catch {
        // A corrupt document is better replaced than allowed to wedge the app.
      }
    }
    emit({ loaded: true, data });
  })();
  return loading;
}

function mutate(change: (data: AppData) => AppData) {
  const data = change(state.data);
  emit({ loaded: true, data });
  void writeItem(KEY, JSON.stringify(data));
}

export interface NewSeasonInput {
  pursuit: Season['pursuit'];
  species?: string;
  jurisdictionId: ID;
  year: number;
  methods: Season['methods'];
  unit?: string;
}

export function addSeason(input: NewSeasonInput): Season {
  const season: Season = {
    id: newId('season'),
    householdId: state.data.householdId,
    pursuit: input.pursuit,
    species: input.species,
    jurisdictionId: input.jurisdictionId,
    unit: input.unit,
    year: input.year,
    status: 'planning',
    windows: [],
    methods: input.methods,
    credentialIds: [],
    regulationIds: [],
    participantIds: [],
  };
  mutate((data) => ({ ...data, seasons: [...data.seasons, season] }));
  return season;
}

export function removeSeason(id: ID) {
  mutate((data) => ({ ...data, seasons: data.seasons.filter((s) => s.id !== id) }));
}

export interface NewWindowInput {
  label: string;
  method?: MethodOfTake;
  opensOn: ISODate;
  closesOn: ISODate;
}

/** Windows stay sorted by opening date so the season reads the way the year runs. */
export function addSeasonWindow(seasonId: ID, input: NewWindowInput) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) => {
      if (season.id !== seasonId) return season;
      const windows = [...season.windows, { id: newId('win'), ...input }].sort((a, b) =>
        a.opensOn.localeCompare(b.opensOn)
      );
      const methods =
        input.method && !season.methods.includes(input.method)
          ? [...season.methods, input.method]
          : season.methods;
      return { ...season, windows, methods };
    }),
  }));
}

export function removeSeasonWindow(seasonId: ID, windowId: ID) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) =>
      season.id === seasonId
        ? { ...season, windows: season.windows.filter((w) => w.id !== windowId) }
        : season
    ),
  }));
}
