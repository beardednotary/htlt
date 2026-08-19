import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';

export default function SeasonsScreen() {
  return (
    <Host style={{ flex: 1 }}>
      <ContentUnavailableView
        title="No Seasons"
        systemImage="calendar"
        description="A season keeps its dates, tags, licenses, methods and regulations in one place."
      />
    </Host>
  );
}
