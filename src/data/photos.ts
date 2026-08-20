import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import { newId } from './ids';

const PHOTO_DIRECTORY = FileSystem.documentDirectory + 'photos/';

export interface PickedPhoto {
  uri: string;
  fileName?: string;
}

async function ensureDirectory(): Promise<void> {
  const info = await FileSystem.getInfoAsync(PHOTO_DIRECTORY);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIRECTORY, { intermediates: true });
  }
}

/**
 * The picker hands back a URI in a temporary location that iOS is free to purge.
 * A photo of a first buck should outlive that, so it is copied into the app's own
 * documents directory and the record points at the copy.
 */
async function persist(asset: ImagePicker.ImagePickerAsset): Promise<PickedPhoto> {
  await ensureDirectory();
  const extension = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
  const uri = `${PHOTO_DIRECTORY}${newId('photo')}.${extension}`;
  await FileSystem.copyAsync({ from: asset.uri, to: uri });
  return { uri, fileName: asset.fileName ?? undefined };
}

export async function pickFromLibrary(): Promise<PickedPhoto | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return persist(result.assets[0]);
}

export async function captureWithCamera(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
  if (result.canceled || result.assets.length === 0) return null;
  return persist(result.assets[0]);
}

/** Best effort: a record removed from the app should not leave its file behind. */
export async function deletePhotoFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // A missing file is the outcome we wanted anyway.
  }
}
