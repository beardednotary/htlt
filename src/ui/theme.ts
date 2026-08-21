import { DynamicColorIOS, PlatformColor } from 'react-native';

/**
 * The background behind our SwiftUI content.
 *
 * React Navigation defaults to a light theme, so without this the screen under a
 * `Host` stays white in dark mode — visible wherever SwiftUI does not paint its own
 * background, like the strip around a segmented control or an empty state.
 *
 * `PlatformColor` resolves to the real UIColor, so it tracks light and dark exactly
 * as the system does. Do not substitute a hex value: the grouped background is black
 * in dark mode but #F2F2F7 in light, and hardcoding either one breaks the other.
 */
export const screenBackground = PlatformColor('systemGroupedBackground');

/**
 * The accent.
 *
 * Derived from the icon rather than lifted from it — the icon's own greens are a
 * deep spruce (#293B39) and an olive (#3A3F2E), both far too dark and desaturated
 * to mark something as tappable. This keeps the family and earns its contrast:
 * 6.0:1 on white, 7.7:1 on the dark background. Anything less and the controls
 * become decoration.
 *
 * Every control the app tints reads from here. Never write the hex anywhere else.
 */
export const accent = DynamicColorIOS({ light: '#2A6F4D', dark: '#69BF94' });

/**
 * What sits on top of a filled accent button. White fails against the lighter dark
 * mode accent (2.2:1), so this flips with the appearance rather than assuming.
 */
export const onAccent = DynamicColorIOS({ light: '#FFFFFF', dark: '#08160F' });
