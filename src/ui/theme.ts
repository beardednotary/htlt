import { PlatformColor } from 'react-native';

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
