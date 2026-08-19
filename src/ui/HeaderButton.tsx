import { Button, Host, Image } from '@expo/ui/swift-ui';
import {
  bold,
  disabled as disabledModifier,
  fixedSize,
  lineLimit,
} from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * A real SwiftUI button placed in the native navigation bar, so it picks up the
 * system tint, Dynamic Type and pressed states rather than imitating them.
 *
 * Two things this has to work around:
 *
 * - The underlying view only honours `systemImage` alongside a text label, so an
 *   icon-only button passes the symbol as a child instead.
 * - `Host matchContents` reports its size to React Native only *after* SwiftUI has
 *   measured, so on the first pass the label is measured inside whatever width the
 *   header happens to give it and comes back compressed. `fixedSize` horizontally
 *   makes the button claim its ideal width regardless of what is proposed, and the
 *   style floor keeps that first pass from starting at nothing.
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
  const modifiers = [fixedSize({ horizontal: true }), lineLimit(1)];
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
          <Image systemName={systemImage ?? 'plus'} />
        </Button>
      )}
    </Host>
  );
}
