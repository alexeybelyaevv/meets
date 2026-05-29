import { PlaceholderTabScreen } from '@/components/placeholder-tab-screen';

export default function SavedScreen() {
  return (
    <PlaceholderTabScreen
      eyebrow="Saved"
      title="Save events for later."
      body="This placeholder will become a shortlist of places, hosts, and events you want to revisit."
      icon={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
    />
  );
}
