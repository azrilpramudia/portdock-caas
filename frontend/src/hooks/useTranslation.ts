import { useSettingsStore } from '@/store/settings';
import { dictionaries } from '@/i18n';

export function useTranslation() {
  const language = useSettingsStore((state) => state.settings.language);
  
  // fallback to en if language is not supported
  const t = dictionaries[language as keyof typeof dictionaries] || dictionaries.en;
  
  return { t };
}
