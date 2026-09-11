import { useAppStore } from '../store/appStore';
import { I18N } from '../constants/i18n';

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return { t: I18N[language], language, setLanguage };
}
