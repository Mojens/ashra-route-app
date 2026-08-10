import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTranslation } from "../hooks/useAppTranslation";

interface StopReachedBannerProps {
  isVisible: boolean;
  placeName?: string | null;
  isRouteCompleted?: boolean;
  onContinue: () => void;
}

export default function StopReachedBanner({
  isVisible,
  placeName,
  isRouteCompleted = false,
  onContinue,
}: StopReachedBannerProps) {
  const { t } = useAppTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <SafeAreaView
      pointerEvents="box-none"
      edges={["top"]}
      className="absolute inset-0"
    >
      <View
        pointerEvents="box-none"
        className="flex-1 px-3 pt-3"
      >
        <View className="rounded-3xl bg-white p-5 shadow-xl">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Text className="text-2xl">
                {isRouteCompleted ? "🏁" : "✓"}
              </Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-slate-900">
                {isRouteCompleted
                  ? t("Turen er færdig")
                  : t("Stop nået")}
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                {isRouteCompleted
                  ? t(
                      "Godt gået! Du er tilbage ved start.",
                    )
                  : placeName
                    ? t(
                        "Du er nået frem til {{place}}.",
                        {
                          place: placeName,
                        },
                      )
                    : t(
                        "Du er nået frem til næste stop.",
                      )}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onContinue}
            className="mt-4 items-center rounded-2xl bg-blue-600 py-3 active:bg-blue-700"
          >
            <Text className="font-bold text-white">
              {isRouteCompleted
                ? t("Færdig")
                : t("Fortsæt")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}