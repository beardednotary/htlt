import { Button, Host, Image, Menu } from '@expo/ui/swift-ui';
import { buttonStyle, fixedSize, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

import { accent } from './theme';

export interface HeaderMenuItem {
  label: string;
  systemImage?: SFSymbol;
  onPress: () => void;
}

/**
 * The top-right `+` with a native menu, contextual to the tab. Never a floating
 * action button — see the design rules.
 *
 * Plain style and no seed colour, for the same reason as HeaderButton: UIKit
 * already draws the capsule, and a SwiftUI material inside it stacks into a halo.
 */
export function HeaderMenu({
  systemImage = 'plus',
  items,
}: {
  systemImage?: SFSymbol;
  items: HeaderMenuItem[];
}) {
  return (
    <Host matchContents style={{ minWidth: 44, minHeight: 44 }}>
      <Menu
        label={<Image systemName={systemImage} color={accent} />}
        modifiers={[buttonStyle('plain'), foregroundStyle(accent), fixedSize({ horizontal: true })]}>
        {items.map((item) => (
          <Button
            key={item.label}
            label={item.label}
            systemImage={item.systemImage}
            onPress={item.onPress}
          />
        ))}
      </Menu>
    </Host>
  );
}
