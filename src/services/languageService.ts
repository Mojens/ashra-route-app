import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

import {
  AppLanguage,
  LANGUAGE_STORAGE_KEY,
} from "../constants";

export async function changeAppLanguage(
  language: AppLanguage,
): Promise<void> {
  await i18n.changeLanguage(language);

  await AsyncStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    language,
  );
}