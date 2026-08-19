import type { Jurisdiction, MethodOfTake } from '../model/types';

/**
 * Jurisdictions are a fixed list rather than user records — a hunter picks one, they
 * don't maintain one. Agency URLs get filled in as we confirm them; we link out to the
 * agency for regulations, we never restate them.
 */
export const JURISDICTIONS: Jurisdiction[] = [
  { id: 'us-al', name: 'Alabama', code: 'AL' },
  { id: 'us-ak', name: 'Alaska', code: 'AK' },
  { id: 'us-az', name: 'Arizona', code: 'AZ' },
  { id: 'us-ar', name: 'Arkansas', code: 'AR' },
  { id: 'us-ca', name: 'California', code: 'CA', agencyName: 'California Department of Fish and Wildlife', agencyUrl: 'https://wildlife.ca.gov' },
  { id: 'us-co', name: 'Colorado', code: 'CO' },
  { id: 'us-ct', name: 'Connecticut', code: 'CT' },
  { id: 'us-de', name: 'Delaware', code: 'DE' },
  { id: 'us-fl', name: 'Florida', code: 'FL' },
  { id: 'us-ga', name: 'Georgia', code: 'GA' },
  { id: 'us-hi', name: 'Hawaii', code: 'HI' },
  { id: 'us-id', name: 'Idaho', code: 'ID' },
  { id: 'us-il', name: 'Illinois', code: 'IL' },
  { id: 'us-in', name: 'Indiana', code: 'IN' },
  { id: 'us-ia', name: 'Iowa', code: 'IA' },
  { id: 'us-ks', name: 'Kansas', code: 'KS' },
  { id: 'us-ky', name: 'Kentucky', code: 'KY' },
  { id: 'us-la', name: 'Louisiana', code: 'LA' },
  { id: 'us-me', name: 'Maine', code: 'ME' },
  { id: 'us-md', name: 'Maryland', code: 'MD' },
  { id: 'us-ma', name: 'Massachusetts', code: 'MA' },
  { id: 'us-mi', name: 'Michigan', code: 'MI' },
  { id: 'us-mn', name: 'Minnesota', code: 'MN' },
  { id: 'us-ms', name: 'Mississippi', code: 'MS' },
  { id: 'us-mo', name: 'Missouri', code: 'MO' },
  { id: 'us-mt', name: 'Montana', code: 'MT' },
  { id: 'us-ne', name: 'Nebraska', code: 'NE' },
  { id: 'us-nv', name: 'Nevada', code: 'NV' },
  { id: 'us-nh', name: 'New Hampshire', code: 'NH' },
  { id: 'us-nj', name: 'New Jersey', code: 'NJ' },
  { id: 'us-nm', name: 'New Mexico', code: 'NM' },
  { id: 'us-ny', name: 'New York', code: 'NY' },
  { id: 'us-nc', name: 'North Carolina', code: 'NC' },
  { id: 'us-nd', name: 'North Dakota', code: 'ND' },
  { id: 'us-oh', name: 'Ohio', code: 'OH' },
  { id: 'us-ok', name: 'Oklahoma', code: 'OK' },
  { id: 'us-or', name: 'Oregon', code: 'OR' },
  { id: 'us-pa', name: 'Pennsylvania', code: 'PA' },
  { id: 'us-ri', name: 'Rhode Island', code: 'RI' },
  { id: 'us-sc', name: 'South Carolina', code: 'SC' },
  { id: 'us-sd', name: 'South Dakota', code: 'SD' },
  { id: 'us-tn', name: 'Tennessee', code: 'TN' },
  { id: 'us-tx', name: 'Texas', code: 'TX' },
  { id: 'us-ut', name: 'Utah', code: 'UT' },
  { id: 'us-vt', name: 'Vermont', code: 'VT' },
  { id: 'us-va', name: 'Virginia', code: 'VA' },
  { id: 'us-wa', name: 'Washington', code: 'WA' },
  { id: 'us-wv', name: 'West Virginia', code: 'WV' },
  { id: 'us-wi', name: 'Wisconsin', code: 'WI' },
  { id: 'us-wy', name: 'Wyoming', code: 'WY' },
  { id: 'us-federal', name: 'Federal', code: 'US' },
];

export function jurisdictionName(id: string): string {
  return JURISDICTIONS.find((j) => j.id === id)?.name ?? 'Unknown';
}

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
