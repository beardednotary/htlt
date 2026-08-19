import type { CredentialKind, ID } from '../model/types';
import { jurisdictionCountry } from './constants';

/**
 * Same object, different word. Canadian agencies write "licence"; American ones write
 * "license". The UI follows the jurisdiction the record belongs to, so an Ontario
 * season reads the way Ontario writes it. Nothing in the data model changes.
 */
export function licenceWord(jurisdictionId: ID): 'License' | 'Licence' {
  return jurisdictionCountry(jurisdictionId) === 'CA' ? 'Licence' : 'License';
}

export function credentialKindLabel(kind: CredentialKind, jurisdictionId: ID): string {
  const canadian = jurisdictionCountry(jurisdictionId) === 'CA';
  switch (kind) {
    case 'license':
      return licenceWord(jurisdictionId);
    case 'tag':
      return 'Tag';
    case 'permit':
      return 'Permit';
    case 'validation':
      // Canadian equivalents are conservation and habitat stamps.
      return canadian ? 'Stamp' : 'Validation';
  }
}

/** Section and button copy: "Licences & Tags" in Canada, "Licenses & Tags" in the U.S. */
export function credentialsSectionTitle(jurisdictionId: ID): string {
  return `${licenceWord(jurisdictionId)}s & Tags`;
}

export function addCredentialLabel(jurisdictionId: ID): string {
  return `Add ${licenceWord(jurisdictionId)} or Tag`;
}
