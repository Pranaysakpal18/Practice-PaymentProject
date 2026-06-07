import { useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCheckoutStore } from '../store/stepStore';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const language = useCheckoutStore((state) => state.language) || 'en';

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return { t, language };
}

export default useTranslation;
