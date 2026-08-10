import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  APP_LANGUAGES,
  AppLanguage,
} from "../constants";
import { useAppTranslation } from "../hooks/useAppTranslation";
import { changeAppLanguage } from "../services/languageService";

export default function SettingsScreen() {
  const { t, i18n } = useAppTranslation();

  const currentLanguage =
    i18n.language as AppLanguage;

  const handleSelectLanguage = async (
    language: AppLanguage,
  ): Promise<void> => {
    if (currentLanguage === language) {
      return;
    }

    await changeAppLanguage(language);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <View className="px-5 pt-4">
        <Text className="text-3xl font-bold text-slate-900">
          {t("Indstillinger")}
        </Text>

        <Text className="mt-1 text-base text-slate-500">
          {t("Tilpas appen til dine præferencer.")}
        </Text>

        <View className="mt-8">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("Sprog")}
          </Text>

          <View className="overflow-hidden rounded-2xl bg-white">
            {APP_LANGUAGES.map(
              (language, index) => {
                const isSelected =
                  currentLanguage === language.code;

                const isLast =
                  index ===
                  APP_LANGUAGES.length - 1;

                return (
                  <Pressable
                    key={language.code}
                    onPress={() =>
                      void handleSelectLanguage(
                        language.code,
                      )
                    }
                    className={[
                      "flex-row items-center px-4 py-4 active:bg-slate-50",
                      !isLast
                        ? "border-b border-slate-100"
                        : "",
                    ].join(" ")}
                  >
                    <Text className="mr-3 text-2xl">
                      {language.flag}
                    </Text>

                    <Text className="flex-1 text-base font-medium text-slate-900">
                      {language.label}
                    </Text>

                    {isSelected && (
                      <View className="h-7 w-7 items-center justify-center rounded-full bg-blue-600">
                        <Text className="font-bold text-white">
                          ✓
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              },
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}