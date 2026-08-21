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
import { PlatformColor, Pressable, StyleSheet, Text } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { accent } from './theme';

/**
 * A navigation bar button, built from React Native rather than SwiftUI.
 *
 * Why not a SwiftUI Host, which is what the rest of the app uses: every Host is a
 * UIHostingController, and a hosting controller's view has a white background by
 * default. expo-modules-core clears it once at init — but UIKit restores it when
 * the view is re-attached or its traits change, which is exactly what a navigation
 * transition does. The result was a white capsule flashing behind every bar button
 * on every tab switch. A bar button is a word or a glyph; it does not need SwiftUI,
 * and keeping hosting controllers out of the navigation bar removes the whole class
 * of problem.
 *
 * Icon-only buttons need expo-symbols for real SF Symbols, which is native. Where
 * it is missing — any build made before it was added — they fall back to the old
 * SwiftUI path so the button still works, flash and all.
 */

type SymbolModule = typeof import('expo-symbols');

let cachedSymbols: SymbolModule | null | undefined;

function symbols(): SymbolModule | null {
  if (cachedSymbols !== undefined) return cachedSymbols;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedSymbols = require('expo-symbols') as SymbolModule;
  } catch {
    cachedSymbols = null;
  }
  return cachedSymbols;
}

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
  if (label) {
    return (
      <Pressable onPress={onPress} disabled={disabled} hitSlop={10} style={styles.pressable}>
        {({ pressed }) => (
          <Text
            style={[
              styles.label,
              prominent && styles.prominent,
              disabled && styles.disabled,
              pressed && styles.pressed,
            ]}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  const Symbols = symbols();
  if (Symbols) {
    return (
      <Pressable onPress={onPress} disabled={disabled} hitSlop={10} style={styles.pressable}>
        {({ pressed }) => (
          <Symbols.SymbolView
            name={systemImage ?? 'plus'}
            tintColor={accent}
            size={22}
            type="monochrome"
            style={[pressed && styles.pressed, disabled && styles.disabled]}
          />
        )}
      </Pressable>
    );
  }

  // Pre-expo-symbols builds keep the SwiftUI button rather than no button at all.
  return (
    <Host matchContents style={{ minWidth: 44, minHeight: 44 }}>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle('plain'),
          foregroundStyle(accent),
          fixedSize({ horizontal: true }),
          lineLimit(1),
          padding({ horizontal: 4 }),
          ...(prominent ? [bold()] : []),
          ...(disabled ? [disabledModifier(true)] : []),
        ]}>
        <Image systemName={systemImage ?? 'plus'} color={accent} />
      </Button>
    </Host>
  );
}

const styles = StyleSheet.create({
  pressable: { minWidth: 32, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 17, color: accent },
  prominent: { fontWeight: '600' },
  disabled: { color: PlatformColor('tertiaryLabel'), opacity: 0.5 },
  pressed: { opacity: 0.4 },
});
