import { Host } from '@expo/ui/swift-ui';
import type { ComponentProps } from 'react';

import { accent } from './theme';

/**
 * Every SwiftUI island in the app, tinted.
 *
 * `Host` seeds its subtree's tint through the SwiftUI environment, and there is no
 * app-wide accent to inherit from in a managed Expo project, so the seed has to be
 * set per host. Using this everywhere instead of `Host` directly means the accent
 * lives in exactly one place and a screen cannot quietly drift back to system blue.
 */
export function AppHost(props: ComponentProps<typeof Host>) {
  return <Host seedColor={accent} {...props} />;
}
