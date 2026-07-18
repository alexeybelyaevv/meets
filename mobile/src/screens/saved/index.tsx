import { PlaceholderTabScreen } from '@/components/placeholder-tab-screen';
import { useLocalization } from '@/features/localization/localization';

export default function SavedScreen() {
  const { t } = useLocalization();

  return (
    <PlaceholderTabScreen
      eyebrow={t('saved.eyebrow')}
      title={t('saved.title')}
      body={t('saved.body')}
      icon={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
    />
  );
}
