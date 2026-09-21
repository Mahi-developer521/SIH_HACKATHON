import { Language } from '../types/surveillance';
import enTranslations from '../i18n/en.json';
import teTranslations from '../i18n/te.json';
import hiTranslations from '../i18n/hi.json';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: enTranslations,
  te: teTranslations,
  hi: hiTranslations
};

export class I18nService {
  private static readonly STORAGE_KEY = 'PASHU_SURAKSHA_LANGUAGE';

  static getSavedLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'en' || saved === 'te' || saved === 'hi') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  }

  static saveLanguage(lang: Language) {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  static get(lang: Language, key: string): string {
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  }
}
