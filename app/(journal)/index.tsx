import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';

export default function JournalScreen() {
  return (
    <Host style={{ flex: 1 }}>
      <ContentUnavailableView
        title="No Entries"
        systemImage="book.closed"
        description="Log a hunt or a fishing trip. Days without a harvest are worth keeping too."
      />
    </Host>
  );
}
