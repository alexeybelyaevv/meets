import { PlaceholderTabScreen } from '@/components/placeholder-tab-screen';

export default function ProfileScreen() {
  return (
    <PlaceholderTabScreen
      eyebrow="Profile"
      title="A simple account space."
      body="Profile details, social links, and preferences will be added here when the auth flow is ready."
      icon={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
    />
  );
}
