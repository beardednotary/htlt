import type { Country, FishingTechnique, Jurisdiction, MethodOfTake } from '../model/types';

/**
 * Jurisdictions are a fixed list rather than user records — a hunter picks one, they
 * don't maintain one. Agency URLs get filled in as we confirm them; we link out to the
 * agency for regulations, we never restate them.
 */
export const JURISDICTIONS: Jurisdiction[] = [
  { id: 'us-al', country: 'US', name: 'Alabama', code: 'AL' },
  { id: 'us-ak', country: 'US', name: 'Alaska', code: 'AK' },
  { id: 'us-az', country: 'US', name: 'Arizona', code: 'AZ' },
  { id: 'us-ar', country: 'US', name: 'Arkansas', code: 'AR' },
  { id: 'us-ca', country: 'US', name: 'California', code: 'CA', agencyName: 'California Department of Fish and Wildlife', agencyUrl: 'https://wildlife.ca.gov' },
  { id: 'us-co', country: 'US', name: 'Colorado', code: 'CO' },
  { id: 'us-ct', country: 'US', name: 'Connecticut', code: 'CT' },
  { id: 'us-de', country: 'US', name: 'Delaware', code: 'DE' },
  { id: 'us-fl', country: 'US', name: 'Florida', code: 'FL' },
  { id: 'us-ga', country: 'US', name: 'Georgia', code: 'GA' },
  { id: 'us-hi', country: 'US', name: 'Hawaii', code: 'HI' },
  { id: 'us-id', country: 'US', name: 'Idaho', code: 'ID' },
  { id: 'us-il', country: 'US', name: 'Illinois', code: 'IL' },
  { id: 'us-in', country: 'US', name: 'Indiana', code: 'IN' },
  { id: 'us-ia', country: 'US', name: 'Iowa', code: 'IA' },
  { id: 'us-ks', country: 'US', name: 'Kansas', code: 'KS' },
  { id: 'us-ky', country: 'US', name: 'Kentucky', code: 'KY' },
  { id: 'us-la', country: 'US', name: 'Louisiana', code: 'LA' },
  { id: 'us-me', country: 'US', name: 'Maine', code: 'ME' },
  { id: 'us-md', country: 'US', name: 'Maryland', code: 'MD' },
  { id: 'us-ma', country: 'US', name: 'Massachusetts', code: 'MA' },
  { id: 'us-mi', country: 'US', name: 'Michigan', code: 'MI' },
  { id: 'us-mn', country: 'US', name: 'Minnesota', code: 'MN' },
  { id: 'us-ms', country: 'US', name: 'Mississippi', code: 'MS' },
  { id: 'us-mo', country: 'US', name: 'Missouri', code: 'MO' },
  { id: 'us-mt', country: 'US', name: 'Montana', code: 'MT' },
  { id: 'us-ne', country: 'US', name: 'Nebraska', code: 'NE' },
  { id: 'us-nv', country: 'US', name: 'Nevada', code: 'NV' },
  { id: 'us-nh', country: 'US', name: 'New Hampshire', code: 'NH' },
  { id: 'us-nj', country: 'US', name: 'New Jersey', code: 'NJ' },
  { id: 'us-nm', country: 'US', name: 'New Mexico', code: 'NM' },
  { id: 'us-ny', country: 'US', name: 'New York', code: 'NY' },
  { id: 'us-nc', country: 'US', name: 'North Carolina', code: 'NC' },
  { id: 'us-nd', country: 'US', name: 'North Dakota', code: 'ND' },
  { id: 'us-oh', country: 'US', name: 'Ohio', code: 'OH' },
  { id: 'us-ok', country: 'US', name: 'Oklahoma', code: 'OK' },
  { id: 'us-or', country: 'US', name: 'Oregon', code: 'OR' },
  { id: 'us-pa', country: 'US', name: 'Pennsylvania', code: 'PA' },
  { id: 'us-ri', country: 'US', name: 'Rhode Island', code: 'RI' },
  { id: 'us-sc', country: 'US', name: 'South Carolina', code: 'SC' },
  { id: 'us-sd', country: 'US', name: 'South Dakota', code: 'SD' },
  { id: 'us-tn', country: 'US', name: 'Tennessee', code: 'TN' },
  { id: 'us-tx', country: 'US', name: 'Texas', code: 'TX' },
  { id: 'us-ut', country: 'US', name: 'Utah', code: 'UT' },
  { id: 'us-vt', country: 'US', name: 'Vermont', code: 'VT' },
  { id: 'us-va', country: 'US', name: 'Virginia', code: 'VA' },
  { id: 'us-wa', country: 'US', name: 'Washington', code: 'WA' },
  { id: 'us-wv', country: 'US', name: 'West Virginia', code: 'WV' },
  { id: 'us-wi', country: 'US', name: 'Wisconsin', code: 'WI' },
  { id: 'us-wy', country: 'US', name: 'Wyoming', code: 'WY' },
  { id: 'us-federal', country: 'US', name: 'Federal (U.S.)', code: 'US' },

  // Canada ships at the model level from v1. Agency names are deliberately absent:
  // the hunter saves the official link, and provincial bodies get renamed often enough
  // that guessing them would age badly.
  { id: 'ca-ab', country: 'CA', name: 'Alberta', code: 'AB' },
  { id: 'ca-bc', country: 'CA', name: 'British Columbia', code: 'BC' },
  { id: 'ca-mb', country: 'CA', name: 'Manitoba', code: 'MB' },
  { id: 'ca-nb', country: 'CA', name: 'New Brunswick', code: 'NB' },
  { id: 'ca-nl', country: 'CA', name: 'Newfoundland and Labrador', code: 'NL' },
  { id: 'ca-ns', country: 'CA', name: 'Nova Scotia', code: 'NS' },
  { id: 'ca-nt', country: 'CA', name: 'Northwest Territories', code: 'NT' },
  { id: 'ca-nu', country: 'CA', name: 'Nunavut', code: 'NU' },
  { id: 'ca-on', country: 'CA', name: 'Ontario', code: 'ON' },
  { id: 'ca-pe', country: 'CA', name: 'Prince Edward Island', code: 'PE' },
  { id: 'ca-qc', country: 'CA', name: 'Quebec', code: 'QC' },
  { id: 'ca-sk', country: 'CA', name: 'Saskatchewan', code: 'SK' },
  { id: 'ca-yt', country: 'CA', name: 'Yukon', code: 'YT' },
  { id: 'ca-federal', country: 'CA', name: 'Federal (Canada)', code: 'CA' },
];

export function jurisdictionName(id: string): string {
  return JURISDICTIONS.find((j) => j.id === id)?.name ?? 'Unknown';
}

export function jurisdictionCountry(id: string): Country {
  return JURISDICTIONS.find((j) => j.id === id)?.country ?? 'US';
}

export const JURISDICTIONS_BY_COUNTRY: { country: Country; label: string; items: Jurisdiction[] }[] = [
  { country: 'US', label: 'United States', items: JURISDICTIONS.filter((j) => j.country === 'US') },
  { country: 'CA', label: 'Canada', items: JURISDICTIONS.filter((j) => j.country === 'CA') },
];

/** Hunter-native wording, ordered by how often it comes up rather than alphabetically. */
export const HUNTING_SPECIES = [
  'Deer',
  'Elk',
  'Turkey',
  'Duck',
  'Goose',
  'Bear',
  'Pronghorn',
  'Upland Game',
  'Small Game',
  'Other',
];

export const METHOD_LABELS: Record<MethodOfTake, string> = {
  rifle: 'Rifle',
  shotgun: 'Shotgun',
  muzzleloader: 'Muzzleloader',
  compoundBow: 'Compound Bow',
  traditionalBow: 'Traditional Bow',
  crossbow: 'Crossbow',
  handgun: 'Handgun',
  airgun: 'Airgun',
  other: 'Other',
};

export const METHOD_ORDER: MethodOfTake[] = [
  'rifle',
  'compoundBow',
  'shotgun',
  'muzzleloader',
  'traditionalBow',
  'crossbow',
  'handgun',
  'airgun',
  'other',
];

export const TECHNIQUE_LABELS: Record<FishingTechnique, string> = {
  fly: 'Fly',
  spin: 'Spin',
  baitcasting: 'Baitcasting',
  trolling: 'Trolling',
  jigging: 'Jigging',
  bottom: 'Bottom',
  surf: 'Surf',
  ice: 'Ice',
  spear: 'Spear',
  other: 'Other',
};

export const TECHNIQUE_ORDER: FishingTechnique[] = [
  'fly',
  'spin',
  'baitcasting',
  'trolling',
  'jigging',
  'bottom',
  'surf',
  'ice',
  'spear',
  'other',
];
