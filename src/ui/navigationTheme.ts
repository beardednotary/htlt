import { DarkTheme } from 'expo-router';
import { PlatformColor } from 'react-native';

import { accent } from './theme';

/**
 * One theme, whose colours UIKit resolves rather than JavaScript.
 *
 * Switching between DarkTheme and DefaultTheme from `useColorScheme()` means the
 * first render can use the wrong one — the hook reports light, or nothing, before
 * it settles — so every header mounts in the wrong appearance and corrects itself a
 * frame later. That is visible as a flash on the title and the bar buttons, and no
 * build configuration makes it go away because it is a render-order problem.
 *
 * `PlatformColor` hands UIKit a semantic colour instead of a resolved value, so the
 * navigation bar is painted correctly on its first frame and follows the system
 * afterwards without React being involved at all.
 */
export const navigationTheme = {
  ...DarkTheme,
  // Only affects incidentals like the default status bar style; the colours below
  // do the real work and resolve per appearance on the native side.
  dark: true,
  colors: {
    primary: accent,
    background: PlatformColor('systemGroupedBackground'),
    card: PlatformColor('systemBackground'),
    text: PlatformColor('label'),
    border: PlatformColor('separator'),
    notification: PlatformColor('systemRed'),
  },
} as typeof DarkTheme;
