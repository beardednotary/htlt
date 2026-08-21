import { Button, Host, Image } from '@expo/ui/swift-ui';
import {
  bold,
  buttonStyle,
  disabled as disabledModifier,
  fixedSize,
  foregroundStyle,
  lineLimit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

import { accent } from './theme';

/**
 * A real SwiftUI button placed in the native navigation bar, so it picks up the
 * system's pressed states and Dynamic Type rather than imitating them.
 *
 * Three things this has to work around, all learned the hard way:
 *
 * - The underlying view only honours `systemImage` alongside a text label, so an
 *   icon-only button passes the symbol as a child instead.
 * - `Host matchContents` reports its size to React Native only after SwiftUI has
 *   measured, so without `fixedSize` the label is measured inside whatever width
 *   the header proposed and comes back compressed.
 * - UIKit already draws a glass capsule behind a bar button item. Any SwiftUI
 *   material inside that — which is what `automatic` resolves to on iOS 26 — stacks
 *   a second one on top and reads as a halo that flashes when the bar re-renders.
 *   So: `plain`, no seed colour, and the accent applied to the content directly.
 *   Deliberately not an AppHost for the same reason — seeding the tint into the
 *   environment colours the material, not just the glyph.
 */
export function HeaderButton({
  label,
  systemImage,
  onPress,
  prominent = false,
  disabled = false,
}: {
  label?: string;
  systemImage?: SFSymbol;
  onPress: () => void;
  prominent?: boolean;
  disabled?: boolean;
}) {
  const modifiers = [
    buttonStyle('plain'),
    foregroundStyle(accent),
    fixedSize({ horizontal: true }),
    lineLimit(1),
    padding({ horizontal: 4 }),
  ];
  if (prominent) modifiers.push(bold());
  if (disabled) modifiers.push(disabledModifier(true));

  return (
    <Host matchContents style={{ minWidth: 44, minHeight: 44 }}>
      {label ? (
        <Button
          label={label}
          systemImage={systemImage}
          onPress={onPress}
          modifiers={modifiers}
        />
      ) : (
        <Button onPress={onPress} modifiers={modifiers}>
          <Image systemName={systemImage ?? 'plus'} color={accent} />
        </Button>
      )}
    </Host>
  );
}
