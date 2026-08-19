import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';

export default function TodayScreen() {
  return (
    <Host style={{ flex: 1 }}>
      <ContentUnavailableView
        title="Nothing Coming Up"
        systemImage="calendar.badge.plus"
        description="Add a season and this screen fills in with openers, deadlines and anything about to expire."
      />
    </Host>
  );
}
