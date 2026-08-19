import { useSyncExternalStore } from 'react';

import type {
  Activity,
  Catch,
  DocumentRef,
  DrawApplication,
  Gear,
  Harvest,
  Credential,
  CredentialKind,
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

/**
 * Credentials belong to a person, so there is always at least one — the owner of the
 * phone. They can rename themselves in Family; nothing here should make them do it first.
 */
export function primaryPersonId(): ID {
  const existing = state.data.people[0];
  if (existing) return existing.id;
  const person: Person = {
    id: newId('person'),
    householdId: state.data.householdId,
    name: 'Me',
    accountId: null,
  };
  mutate((data) => ({ ...data, people: [...data.people, person] }));
  return person.id;
}

export interface NewCredentialInput {
  kind: CredentialKind;
  name: string;
  jurisdictionId: ID;
  number?: string;
  year?: number;
  validUntil?: ISODate;
}

export function addCredential(input: NewCredentialInput): Credential {
  const credential: Credential = {
    id: newId('cred'),
    personId: primaryPersonId(),
    kind: input.kind,
    name: input.name,
    jurisdictionId: input.jurisdictionId,
    number: input.number,
    year: input.year,
    validUntil: input.validUntil,
    documentIds: [],
  };
  mutate((data) => ({ ...data, credentials: [...data.credentials, credential] }));
  return credential;
}

export function linkCredential(seasonId: ID, credentialId: ID) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) =>
      season.id === seasonId && !season.credentialIds.includes(credentialId)
        ? { ...season, credentialIds: [...season.credentialIds, credentialId] }
        : season
    ),
  }));
}

export function unlinkCredential(seasonId: ID, credentialId: ID) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) =>
      season.id === seasonId
        ? { ...season, credentialIds: season.credentialIds.filter((id) => id !== credentialId) }
        : season
    ),
  }));
}

export interface NewRegulationInput {
  title: string;
  url?: string;
  notes?: string;
}

/** A bare domain is still a link; make it one rather than rejecting it. */
function normalizeUrl(url?: string): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * We store the pointer to the agency's page, the hunter's own notes, and when they
 * last looked. We never store the regulation itself — that is the agency's job and
 * their liability, not ours.
 */
export function addRegulation(seasonId: ID, input: NewRegulationInput): RegulationRef {
  const season = state.data.seasons.find((s) => s.id === seasonId);
  const regulation: RegulationRef = {
    id: newId('reg'),
    jurisdictionId: season?.jurisdictionId ?? 'us-ca',
    title: input.title.trim(),
    url: normalizeUrl(input.url),
    notes: input.notes?.trim() || undefined,
    documentIds: [],
  };
  mutate((data) => ({
    ...data,
    regulations: [...data.regulations, regulation],
    seasons: data.seasons.map((s) =>
      s.id === seasonId ? { ...s, regulationIds: [...s.regulationIds, regulation.id] } : s
    ),
  }));
  return regulation;
}

export function markRegulationReviewed(regulationId: ID, on: ISODate) {
  mutate((data) => ({
    ...data,
    regulations: data.regulations.map((regulation) =>
      regulation.id === regulationId ? { ...regulation, lastReviewedOn: on } : regulation
    ),
  }));
}

export function removeRegulation(seasonId: ID, regulationId: ID) {
  mutate((data) => ({
    ...data,
    regulations: data.regulations.filter((regulation) => regulation.id !== regulationId),
    seasons: data.seasons.map((season) =>
      season.id === seasonId
        ? { ...season, regulationIds: season.regulationIds.filter((id) => id !== regulationId) }
        : season
    ),
  }));
}
