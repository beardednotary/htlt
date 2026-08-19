/**
 * Persistence.
 *
 * Backed by expo-sqlite's key-value store. That is a native module, so it is absent
 * from any development build made before it was added — we fall back to memory in
 * that case rather than crashing, and start persisting the moment the app is rebuilt.
 */

type Backend = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

let backend: Backend | null = null;
let available = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('expo-sqlite/kv-store');
  backend = (mod?.default ?? mod) as Backend;
  available = typeof backend?.getItemAsync === 'function';
} catch {
  backend = null;
  available = false;
}

const memory = new Map<string, string>();

/** False when the native module is missing, which means nothing survives a reload. */
export function isPersistent(): boolean {
  return available;
}

export async function readItem(key: string): Promise<string | null> {
  if (available && backend) {
    try {
      return await backend.getItemAsync(key);
    } catch {
      available = false;
    }
  }
  return memory.get(key) ?? null;
}

export async function writeItem(key: string, value: string): Promise<void> {
  memory.set(key, value);
  if (available && backend) {
    try {
      await backend.setItemAsync(key, value);
    } catch {
      available = false;
    }
  }
}
