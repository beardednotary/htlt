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
 * Still a SwiftUI Host, unlike HeaderButton, because React Native has no anchored
 * pull-down menu and an action sheet is a different control. That makes this the
 * control group: if the white flash survives here but not on the plain buttons,
 * the hosting controller's background is confirmed as the cause.
 */
export function HeaderMenu({
  systemImage = 'plus',
  items,
}: {
  systemImage?: SFSymbol;
  items: HeaderMenuItem[];
}) {
  return (
    <Host
      matchContents
      style={{ minWidth: 44, minHeight: 44, backgroundColor: 'transparent' }}>
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
