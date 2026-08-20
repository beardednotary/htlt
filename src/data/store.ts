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
  FishingTechnique,
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
export interface AppSettings {
  /** Off until asked for. We never request notification permission on first launch. */
  remindersEnabled: boolean;
  /** Year → document id. A chosen recap cover beats the automatic pick. */
  recapCovers?: Record<string, ID>;
  /** The walkthrough is shown once, then lives in Settings for whenever it is wanted. */
  welcomeSeen?: boolean;
}

export interface AppData {
  schemaVersion: number;
  householdId: ID;
  settings: AppSettings;
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
    settings: { remindersEnabled: false },
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
        data = {
          ...data,
          ...parsed,
          // Documents written before a setting existed must not arrive without it.
          settings: { ...data.settings, ...(parsed.settings ?? {}) },
          schemaVersion: SCHEMA_VERSION,
        };
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
  /** Whose it is. Defaults to the household's owner when there is only one person. */
  personId?: ID;
  number?: string;
  year?: number;
  validUntil?: ISODate;
}

export function addCredential(input: NewCredentialInput): Credential {
  const credential: Credential = {
    id: newId('cred'),
    personId: input.personId ?? primaryPersonId(),
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

export interface NewActivityInput {
  pursuit: Activity['pursuit'];
  date: ISODate;
  seasonId?: ID;
  locationName?: string;
  methodOfTake?: MethodOfTake;
  technique?: FishingTechnique;
  notes?: string;
}

/**
 * A day afield with nothing to show for it is still a record worth keeping, so
 * nothing here is required beyond the date and whether you were hunting or fishing.
 */
export function addActivity(input: NewActivityInput): Activity {
  const personId = primaryPersonId();
  const activity: Activity = {
    id: newId('act'),
    householdId: state.data.householdId,
    seasonId: input.seasonId,
    pursuit: input.pursuit,
    date: input.date,
    locationName: input.locationName?.trim() || undefined,
    participantIds: [personId],
    methodOfTake: input.methodOfTake,
    technique: input.technique,
    gearIds: [],
    documentIds: [],
    notes: input.notes?.trim() || undefined,
  };
  mutate((data) => ({ ...data, activities: [...data.activities, activity] }));
  return activity;
}

export function removeActivity(id: ID) {
  mutate((data) => ({
    ...data,
    activities: data.activities.filter((activity) => activity.id !== id),
    harvests: data.harvests.filter((harvest) => harvest.activityId !== id),
    catches: data.catches.filter((entry) => entry.activityId !== id),
  }));
}

export interface NewHarvestInput {
  activityId: ID;
  species: string;
  sex?: Harvest['sex'];
  points?: number;
  /** The tag it was taken on, when the season has one linked. */
  credentialId?: ID;
  gearId?: ID;
  notes?: string;
}

export function addHarvest(input: NewHarvestInput): Harvest {
  const harvest: Harvest = {
    id: newId('harvest'),
    activityId: input.activityId,
    species: input.species.trim(),
    sex: input.sex,
    points: input.points,
    credentialId: input.credentialId,
    gearId: input.gearId,
    documentIds: [],
    notes: input.notes?.trim() || undefined,
  };
  mutate((data) => ({ ...data, harvests: [...data.harvests, harvest] }));
  return harvest;
}

export function removeHarvest(id: ID) {
  mutate((data) => ({ ...data, harvests: data.harvests.filter((h) => h.id !== id) }));
}

export interface NewCatchInput {
  activityId: ID;
  species: string;
  quantity: number;
  kept: boolean;
  lengthIn?: number;
  weightLb?: number;
  notes?: string;
}

export function addCatch(input: NewCatchInput): Catch {
  const entry: Catch = {
    id: newId('catch'),
    activityId: input.activityId,
    species: input.species.trim(),
    quantity: Math.max(1, Math.round(input.quantity)),
    kept: input.kept,
    lengthIn: input.lengthIn,
    weightLb: input.weightLb,
    gearIds: [],
    documentIds: [],
    notes: input.notes?.trim() || undefined,
  };
  mutate((data) => ({ ...data, catches: [...data.catches, entry] }));
  return entry;
}

export function removeCatch(id: ID) {
  mutate((data) => ({ ...data, catches: data.catches.filter((c) => c.id !== id) }));
}

/** The tag a harvest would most plausibly have been taken on for this season. */
export function tagForSeason(seasonId: ID | undefined): ID | undefined {
  if (!seasonId) return undefined;
  const season = state.data.seasons.find((s) => s.id === seasonId);
  if (!season) return undefined;
  const tag = state.data.credentials.find(
    (credential) => season.credentialIds.includes(credential.id) && credential.kind === 'tag'
  );
  return tag?.id;
}

export interface NewPersonInput {
  name: string;
  birthYear?: number;
  huntingSince?: number;
  notes?: string;
}

/**
 * People do not need accounts. Dad, Grandpa and a nine-year-old all exist here as
 * records someone else maintains — that is the point of the Family tier, and it is
 * what lets a lifetime of hunts belong to someone who will never install the app.
 */
export function addPerson(input: NewPersonInput): Person {
  const person: Person = {
    id: newId('person'),
    householdId: state.data.householdId,
    name: input.name.trim(),
    accountId: null,
    birthYear: input.birthYear,
    huntingSince: input.huntingSince,
    notes: input.notes?.trim() || undefined,
  };
  mutate((data) => ({ ...data, people: [...data.people, person] }));
  return person;
}

export function renamePerson(id: ID, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  mutate((data) => ({
    ...data,
    people: data.people.map((person) =>
      person.id === id ? { ...person, name: trimmed } : person
    ),
  }));
}

/**
 * Removing a person takes their credentials with them — a license belongs to a
 * person and means nothing without one — and detaches them from anything shared.
 * Hunts they were on survive; the day still happened.
 */
export function removePerson(id: ID) {
  mutate((data) => {
    const ownedCredentialIds = data.credentials
      .filter((credential) => credential.personId === id)
      .map((credential) => credential.id);
    return {
      ...data,
      people: data.people.filter((person) => person.id !== id),
      credentials: data.credentials.filter((credential) => credential.personId !== id),
      gear: data.gear.map((item) => (item.personId === id ? { ...item, personId: undefined } : item)),
      seasons: data.seasons.map((season) => ({
        ...season,
        participantIds: season.participantIds.filter((participantId) => participantId !== id),
        credentialIds: season.credentialIds.filter(
          (credentialId) => !ownedCredentialIds.includes(credentialId)
        ),
      })),
      trips: data.trips.map((trip) => ({
        ...trip,
        participantIds: trip.participantIds.filter((participantId) => participantId !== id),
      })),
      activities: data.activities.map((activity) => ({
        ...activity,
        participantIds: activity.participantIds.filter((participantId) => participantId !== id),
      })),
      milestones: data.milestones.filter((milestone) => milestone.personId !== id),
    };
  });
}

export function addSeasonParticipant(seasonId: ID, personId: ID) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) =>
      season.id === seasonId && !season.participantIds.includes(personId)
        ? { ...season, participantIds: [...season.participantIds, personId] }
        : season
    ),
  }));
}

export function removeSeasonParticipant(seasonId: ID, personId: ID) {
  mutate((data) => ({
    ...data,
    seasons: data.seasons.map((season) =>
      season.id === seasonId
        ? {
            ...season,
            participantIds: season.participantIds.filter((id) => id !== personId),
          }
        : season
    ),
  }));
}

export function setRemindersEnabled(enabled: boolean) {
  mutate((data) => ({ ...data, settings: { ...data.settings, remindersEnabled: enabled } }));
}

export interface NewPhotoInput {
  uri: string;
  fileName?: string;
  caption?: string;
}

/** Photos attach to whatever they are of — the day, or the animal taken on it. */
export function addPhotoToActivity(activityId: ID, input: NewPhotoInput): DocumentRef {
  const document: DocumentRef = {
    id: newId('doc'),
    householdId: state.data.householdId,
    kind: 'photo',
    uri: input.uri,
    fileName: input.fileName,
    capturedAt: new Date().toISOString(),
    caption: input.caption,
  };
  mutate((data) => ({
    ...data,
    documents: [...data.documents, document],
    activities: data.activities.map((activity) =>
      activity.id === activityId
        ? { ...activity, documentIds: [...activity.documentIds, document.id] }
        : activity
    ),
  }));
  return document;
}

export function addPhotoToHarvest(harvestId: ID, input: NewPhotoInput): DocumentRef {
  const document: DocumentRef = {
    id: newId('doc'),
    householdId: state.data.householdId,
    kind: 'photo',
    uri: input.uri,
    fileName: input.fileName,
    capturedAt: new Date().toISOString(),
    caption: input.caption,
  };
  mutate((data) => ({
    ...data,
    documents: [...data.documents, document],
    harvests: data.harvests.map((harvest) =>
      harvest.id === harvestId
        ? { ...harvest, documentIds: [...harvest.documentIds, document.id] }
        : harvest
    ),
  }));
  return document;
}

/** Detaches from everything that referenced it, so no record points at a ghost. */
export function removeDocument(id: ID) {
  mutate((data) => ({
    ...data,
    documents: data.documents.filter((document) => document.id !== id),
    activities: data.activities.map((activity) => ({
      ...activity,
      documentIds: activity.documentIds.filter((documentId) => documentId !== id),
    })),
    harvests: data.harvests.map((harvest) => ({
      ...harvest,
      documentIds: harvest.documentIds.filter((documentId) => documentId !== id),
    })),
    catches: data.catches.map((entry) => ({
      ...entry,
      documentIds: entry.documentIds.filter((documentId) => documentId !== id),
    })),
    credentials: data.credentials.map((credential) => ({
      ...credential,
      documentIds: credential.documentIds.filter((documentId) => documentId !== id),
    })),
    regulations: data.regulations.map((regulation) => ({
      ...regulation,
      documentIds: regulation.documentIds.filter((documentId) => documentId !== id),
    })),
  }));
}

/** A standalone photo, belonging to no record — a recap cover, for instance. */
export function addPhotoDocument(input: NewPhotoInput): DocumentRef {
  const document: DocumentRef = {
    id: newId('doc'),
    householdId: state.data.householdId,
    kind: 'photo',
    uri: input.uri,
    fileName: input.fileName,
    capturedAt: new Date().toISOString(),
    caption: input.caption,
  };
  mutate((data) => ({ ...data, documents: [...data.documents, document] }));
  return document;
}

export function setRecapCover(year: number, documentId: ID | undefined) {
  mutate((data) => {
    const covers = { ...(data.settings.recapCovers ?? {}) };
    if (documentId) covers[String(year)] = documentId;
    else delete covers[String(year)];
    return { ...data, settings: { ...data.settings, recapCovers: covers } };
  });
}

export function recapCoverUri(year: number): string | undefined {
  const id = state.data.settings.recapCovers?.[String(year)];
  if (!id) return undefined;
  return state.data.documents.find((document) => document.id === id)?.uri;
}

export function setWelcomeSeen(seen: boolean) {
  mutate((data) => ({ ...data, settings: { ...data.settings, welcomeSeen: seen } }));
}
