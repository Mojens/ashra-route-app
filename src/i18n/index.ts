// Mangler noget her
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { AppLanguage, LANGUAGE_STORAGE_KEY } from "../constants";
import daDK from "../locales/da-DK/translation";
import enGB from "../locales/en-GB/translation";
import enUS from "../locales/en-US/translation";

const SUPPORTED_LANGUAGES: AppLanguage[] = [
  "da-DK",
  "en-GB",
  "en-US",
];

function isSupportedLanguage(
  language: string,
): language is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(
    language as AppLanguage,
  );
}
const SUPPORTED_LANGUAGE_TAGS = {
  "da-DK": "da-DK",
  "en-GB": "en-GB",
  "en-US": "en-US",
} as const;

const LANGUAGE_FALLBACKS = {
  da: "da-DK",
  en: "en-GB",
} as const;

type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGE_TAGS)[keyof typeof SUPPORTED_LANGUAGE_TAGS];

const DEFAULT_LANGUAGE: SupportedLanguage = "da-DK";

const resources = {
  "da-DK": {
    translation: daDK,
  },
  "en-GB": {
    translation: enGB,
  },
  "en-US": {
    translation: enUS,
  },
} as const;

function getDeviceLanguage(): SupportedLanguage {
  const locale = Localization.getLocales()[0];

  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  const exactLanguage =
    SUPPORTED_LANGUAGE_TAGS[
    locale.languageTag as keyof typeof SUPPORTED_LANGUAGE_TAGS
    ];

  if (exactLanguage) {
    return exactLanguage;
  }

  const fallbackLanguage =
    LANGUAGE_FALLBACKS[
    locale.languageCode as keyof typeof LANGUAGE_FALLBACKS
    ];

  return fallbackLanguage ?? DEFAULT_LANGUAGE;
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),

    supportedLngs: Object.keys(
      SUPPORTED_LANGUAGE_TAGS,
    ),

    fallbackLng: [DEFAULT_LANGUAGE],

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;