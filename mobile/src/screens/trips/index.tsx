import { PlaceholderTabScreen } from '@/components/placeholder-tab-screen';

export default function TripsScreen() {
  return (
    <PlaceholderTabScreen
      eyebrow="Trips"
      title="Your plans will live here."
      body="Upcoming events, invites, and joined meetups will show up here once the real events flow is connected."
      icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
    />
  );
}
