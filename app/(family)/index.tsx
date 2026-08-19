import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';

export default function FamilyScreen() {
  return (
    <Host style={{ flex: 1 }}>
      <ContentUnavailableView
        title="No People Yet"
        systemImage="person.2"
        description="Add the people you hunt and fish with. They don't need an account of their own."
      />
    </Host>
  );
}
