export const APP_LANGUAGES = [
  {
    code: "da-DK",
    label: "Dansk",
    flag: "🇩🇰",
  },
  {
    code: "en-GB",
    label: "English (UK)",
    flag: "🇬🇧",
  },
  {
    code: "en-US",
    label: "English (US)",
    flag: "🇺🇸",
  },
] as const;

export type AppLanguage =
  (typeof APP_LANGUAGES)[number]["code"];

export const LANGUAGE_STORAGE_KEY =
  "ashra-language";