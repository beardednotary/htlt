import {Button, Image, Menu} from '@expo/ui/swift-ui';
import { fixedSize } from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';
import { AppHost } from './AppHost';

export interface HeaderMenuItem {
  label: string;
  systemImage?: SFSymbol;
  onPress: () => void;
}

/**
 * The top-right `+` with a native menu, contextual to the tab. Never a floating
 * action button — see the design rules.
 */
export function HeaderMenu({
  systemImage = 'plus',
  items,
}: {
  systemImage?: SFSymbol;
  items: HeaderMenuItem[];
}) {
  return (
    <AppHost matchContents style={{ minWidth: 44, minHeight: 44 }}>
      <Menu label={<Image systemName={systemImage} />} modifiers={[fixedSize({ horizontal: true })]}>
        {items.map((item) => (
          <Button
            key={item.label}
            label={item.label}
            systemImage={item.systemImage}
            onPress={item.onPress}
          />
        ))}
      </Menu>
    </AppHost>
  );
}
