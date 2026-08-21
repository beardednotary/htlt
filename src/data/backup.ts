import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { todayISO } from '../model/derive';
import type { AppData } from './store';

/**
 * A plain JSON copy of everything the household has entered.
 *
 * Not a sync service and not pretending to be one. The app is local-first, its
 * records already ride along in the device's own backup, and this exists so nobody
 * has to take that on faith — you can hold the file, read it, and put it back.
 */
export function serialize(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Anything that does not look like our document is rejected outright. Importing
 * replaces everything, so a half-understood file is worse than no file.
 */
export function parseSnapshot(raw: string): AppData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<AppData>;

  const requiredArrays: (keyof AppData)[] = [
    'people',
    'credentials',
    'seasons',
    'activities',
    'harvests',
    'catches',
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(candidate[key])) return null;
  }
  if (typeof candidate.householdId !== 'string') return null;

  return candidate as AppData;
}

export async function exportData(data: AppData): Promise<void> {
  const uri = `${FileSystem.cacheDirectory}hunting-records-${todayISO()}.json`;
  await FileSystem.writeAsStringAsync(uri, serialize(data));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Your hunting records',
    });
  }
}

export type ImportResult =
  | { status: 'cancelled' }
  | { status: 'invalid' }
  | { status: 'ok'; data: AppData };

export async function pickImportFile(): Promise<ImportResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'public.json'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return { status: 'cancelled' };

  try {
    const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const data = parseSnapshot(raw);
    return data ? { status: 'ok', data } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
