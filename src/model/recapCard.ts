import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';

/**
 * Captures the recap card as an image and hands it to the share sheet.
 *
 * react-native-view-shot is native, so it is required lazily and a build made
 * before it was added falls back to the PDF rather than crashing. The card is a
 * real view rendered off-screen, not a second rendering of the same numbers in a
 * canvas — one source of truth for what a year looked like.
 */
type ViewShotModule = typeof import('react-native-view-shot');

let cached: ViewShotModule | null | undefined;

function viewShot(): ViewShotModule | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('react-native-view-shot') as ViewShotModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function shareCardAvailable(): boolean {
  return viewShot() !== null;
}

export async function shareRecapImage(
  ref: RefObject<View | null>,
  year: number
): Promise<boolean> {
  const module = viewShot();
  if (!module || !ref.current) return false;

  try {
    const uri = await module.captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      fileName: `hunting-${year}`,
    });
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: `${year} Season Recap`,
    });
    return true;
  } catch {
    return false;
  }
}
