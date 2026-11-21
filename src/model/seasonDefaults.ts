import type { ID, Season } from './types';

const FALLBACK_US = 'us-ca';
const FALLBACK_CA = 'ca-on';

/**
 * The country part of the device's locale ("en-CA" → "CA"), or undefined. Read once
 * at the call site and passed in, so the decision below stays testable.
 */
export function deviceRegion(): string | undefined {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const match = /[-_]([A-Z]{2})(?:$|[-_])/.exec(locale);
    return match?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Where a new season most likely is.
 *
 * Most hunters add several seasons in the same state or province, so the last one
 * entered is the best guess. With nothing entered yet, a Canadian phone starts in
 * Canada rather than in California — the first form a Canadian sees should not be
 * telling them the app is for someone else.
 */
export function defaultJurisdictionId(seasons: Pick<Season, 'jurisdictionId'>[], region?: string): ID {
  const last = seasons[seasons.length - 1];
  if (last) return last.jurisdictionId;
  return region === 'CA' ? FALLBACK_CA : FALLBACK_US;
}
