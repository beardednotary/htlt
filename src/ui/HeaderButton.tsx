import { Button, Host } from '@expo/ui/swift-ui';
import { bold, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * A real SwiftUI button placed in the native navigation bar, so it picks up the
 * system tint, Dynamic Type and pressed states rather than imitating them.
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
  const modifiers = [];
  if (prominent) modifiers.push(bold());
  if (disabled) modifiers.push(disabledModifier(true));

  return (
    <Host matchContents>
      <Button
        label={label}
        systemImage={systemImage}
        onPress={onPress}
        modifiers={modifiers.length > 0 ? modifiers : undefined}
      />
    </Host>
  );
}
