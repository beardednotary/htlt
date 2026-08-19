/**
 * The locked data model.
 *
 *   Household
 *   ├── People              (no account required)
 *   │   ├── Credentials     (license | tag | permit | validation)
 *   │   └── Gear
 *   ├── Seasons             (the center of the app)
 *   │   └── DrawApplication (lives inside the season, not a separate module)
 *   ├── Trips
 *   │   └── Activities      (a hunt or a fishing session)
 *   │       └── Harvest / Catch
 *   └── Documents
 *
 * Rules encoded here:
 *  - Credentials are reusable objects referenced by many seasons, never copied into them.
 *  - license / tag / permit / validation stay distinct internally even though the UI
 *    groups them all under "Licenses & Tags".
 *  - Method of take lives on the season, not only on the harvest record.
 *  - Trip, Activity and Harvest/Catch are three separate concepts.
 *  - An activity with no harvest is a first-class record.
 *  - We never become the source of truth for regulations: we store the agency link,
 *    the user's notes/PDF, and when they last reviewed it.
 */

export type ID = string;

/** Calendar date with no time component, e.g. "2027-08-08". */
export type ISODate = string;
/** Instant, e.g. "2027-08-08T06:15:00Z". */
export type ISODateTime = string;

export type Pursuit = 'hunting' | 'fishing';

export type MethodOfTake =
  | 'rifle'
  | 'shotgun'
  | 'muzzleloader'
  | 'compoundBow'
  | 'traditionalBow'
  | 'crossbow'
  | 'handgun'
  | 'airgun'
  | 'other';

export type FishingTechnique =
  | 'fly'
  | 'spin'
  | 'baitcasting'
  | 'trolling'
  | 'jigging'
  | 'bottom'
  | 'surf'
  | 'ice'
  | 'spear'
  | 'other';

export interface Household {
  id: ID;
  name: string;
  createdAt: ISODateTime;
}

export interface Person {
  id: ID;
  householdId: ID;
  name: string;
  /** Null for the people who exist only as records someone else maintains — Dad, Grandpa, a nine-year-old. */
  accountId: ID | null;
  birthYear?: number;
  huntingSince?: number;
  photoId?: ID;
  notes?: string;
}

export interface Jurisdiction {
  id: ID;
  /** "California", "Federal" */
  name: string;
  /** "CA" */
  code?: string;
  agencyName?: string;
  agencyUrl?: string;
}

/** Kept distinct on purpose. The UI may present all four together; the database must not conflate them. */
export type CredentialKind = 'license' | 'tag' | 'permit' | 'validation';

export interface Credential {
  id: ID;
  personId: ID;
  kind: CredentialKind;
  /** "California Hunting License", "A Zone Deer Tag", "Federal Duck Stamp" */
  name: string;
  jurisdictionId: ID;
  number?: string;
  species?: string;
  /** License year, which is not always the calendar year. */
  year?: number;
  purchasedOn?: ISODate;
  validFrom?: ISODate;
  validUntil?: ISODate;
  /** Reference copies. Never presented as a valid electronic license. */
  documentIds: ID[];
  notes?: string;
}

export type DrawStatus =
  | 'planning'
  | 'applied'
  | 'drawn'
  | 'notDrawn'
  | 'purchased'
  | 'complete';

export interface DrawApplication {
  id: ID;
  seasonId: ID;
  personId: ID;
  status: DrawStatus;
  opensOn?: ISODate;
  deadline?: ISODate;
  resultsOn?: ISODate;
  preferencePoints?: number;
  /** Set once the draw produces a tag. */
  credentialId?: ID;
  notes?: string;
}

/** One dated window within a season — archery, general/rifle, youth, muzzleloader. */
export interface SeasonWindow {
  id: ID;
  /** "Archery", "General / Rifle" */
  label: string;
  method?: MethodOfTake;
  opensOn: ISODate;
  closesOn: ISODate;
}

export type SeasonStatus = 'planning' | 'active' | 'complete';

export interface Season {
  id: ID;
  householdId: ID;
  pursuit: Pursuit;
  /** "Deer", "Elk", "Waterfowl". Optional for a plain annual fishing season. */
  species?: string;
  jurisdictionId: ID;
  /** "A Zone", "Unit 61" */
  unit?: string;
  year: number;
  status: SeasonStatus;
  windows: SeasonWindow[];
  methods: MethodOfTake[];
  /** References to reusable credentials — the license is entered once and pointed at many seasons. */
  credentialIds: ID[];
  regulationIds: ID[];
  drawApplicationId?: ID;
  participantIds: ID[];
  harvestReportDueOn?: ISODate;
  notes?: string;
}

export interface RegulationRef {
  id: ID;
  jurisdictionId: ID;
  /** "2027 California Mammal Hunting Regulations" */
  title: string;
  /** The official agency page. We link; we do not restate the law. */
  url?: string;
  documentIds: ID[];
  notes?: string;
  lastReviewedOn?: ISODate;
}

export type GearKind =
  | 'rifle'
  | 'shotgun'
  | 'muzzleloader'
  | 'bow'
  | 'crossbow'
  | 'handgun'
  | 'airgun'
  | 'rod'
  | 'reel'
  | 'other';

export interface Gear {
  id: ID;
  householdId: ID;
  /** Whose it is, when that matters. Gear history is a retention feature, not an inventory system. */
  personId?: ID;
  kind: GearKind;
  /** "Tikka T3x", "Mathews Lift", "Sage Foundation 5wt" */
  name: string;
  /** ".30-06 Springfield", "70 lb draw", "5wt" */
  detail?: string;
  acquiredYear?: number;
  photoId?: ID;
  notes?: string;
}

export interface Trip {
  id: ID;
  householdId: ID;
  /** "Colorado Elk Camp", "Opening Weekend" */
  name: string;
  startsOn: ISODate;
  endsOn: ISODate;
  locationName?: string;
  participantIds: ID[];
  seasonIds: ID[];
  notes?: string;
}

/** A single hunt or fishing session. Belongs to a trip when there was one. */
export interface Activity {
  id: ID;
  householdId: ID;
  tripId?: ID;
  seasonId?: ID;
  pursuit: Pursuit;
  date: ISODate;
  startedAt?: ISODateTime;
  endedAt?: ISODateTime;
  locationName?: string;
  participantIds: ID[];
  methodOfTake?: MethodOfTake;
  technique?: FishingTechnique;
  gearIds: ID[];
  weather?: string;
  miles?: number;
  /** An unsuccessful hunt is still worth recording. */
  animalsSeen?: number;
  documentIds: ID[];
  notes?: string;
}

export interface Harvest {
  id: ID;
  activityId: ID;
  species: string;
  sex?: 'male' | 'female' | 'unknown';
  points?: number;
  weightLb?: number;
  /** The tag this harvest was taken on. */
  credentialId?: ID;
  gearId?: ID;
  reportedOn?: ISODate;
  documentIds: ID[];
  notes?: string;
}

export interface Catch {
  id: ID;
  activityId: ID;
  species: string;
  quantity: number;
  lengthIn?: number;
  weightLb?: number;
  kept: boolean;
  gearIds: ID[];
  documentIds: ID[];
  notes?: string;
}

export interface DocumentRef {
  id: ID;
  householdId: ID;
  kind: 'photo' | 'pdf';
  uri: string;
  fileName?: string;
  capturedAt?: ISODateTime;
  caption?: string;
}

/** A milestone worth surfacing on a person's profile: first deer, first trout, first hunt with Dad. */
export interface Milestone {
  id: ID;
  personId: ID;
  title: string;
  date: ISODate;
  activityId?: ID;
  harvestId?: ID;
  catchId?: ID;
  documentIds: ID[];
}
