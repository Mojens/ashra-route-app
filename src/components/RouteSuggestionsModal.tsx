import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { CATEGORY_LABELS } from "../constants";
import { GeneratedRoutePlan } from "../services/routePlanner";
import {
  formatDistanceKm,
  formatDurationMinutes,
} from "../utils/format";

interface RouteSuggestionsModalProps {
  visible: boolean;
  suggestions: GeneratedRoutePlan[];
  onSelectRoute: (
    suggestion: GeneratedRoutePlan,
  ) => void;
  onClose: () => void;
}

export default function RouteSuggestionsModal({
  visible,
  suggestions,
  onSelectRoute,
  onClose,
}: RouteSuggestionsModalProps) {
    const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-slate-100">
        <View className="flex-row items-center justify-between px-5 py-4">
          <View>
            <Text className="text-2xl font-bold text-slate-900">
              {t("Vælg en rute")}
            </Text>

            <Text className="mt-1 text-sm text-slate-500">
              {t("Vælg det ruteforslag, der passer dig bedst")}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-xl font-bold text-slate-700">
              ×
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="gap-3 px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          {suggestions.map((suggestion, index) => (
            <RouteSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              suggestionNumber={index + 1}
              onPress={() =>
                onSelectRoute(suggestion)
              }
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

interface RouteSuggestionCardProps {
  suggestion: GeneratedRoutePlan;
  suggestionNumber: number;
  onPress: () => void;
}

function RouteSuggestionCard({
  suggestion,
  suggestionNumber,
  onPress,
}: RouteSuggestionCardProps) {
      const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl bg-white p-5 shadow-sm active:bg-slate-50"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-slate-900">
            {t("Rute")} {suggestionNumber}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {suggestion.waypoints
              .map(
                ({ category, place }) =>
                  place.name ||
                  t(CATEGORY_LABELS[category]),
              )
              .join(" → ")}
          </Text>
        </View>

        {suggestionNumber === 1 && (
          <View className="rounded-full bg-green-100 px-3 py-1">
            <Text className="text-xs font-bold text-green-700">
              {t("BEDSTE MATCH")}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-4 flex-row justify-between rounded-2xl bg-slate-50 p-4">
        <View>
          <Text className="text-xs uppercase text-slate-500">
            {t("Distance")}
          </Text>

          <Text className="mt-1 font-bold text-slate-900">
            {formatDistanceKm(
              suggestion.route.distanceMeters,
            )}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-xs uppercase text-slate-500">
            {t("Tid")}
          </Text>

          <Text className="mt-1 font-bold text-slate-900">
            {formatDurationMinutes(
              suggestion.route.durationSeconds,
            )}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xs uppercase text-slate-500">
            {t("Forskel")}
          </Text>

          <Text className="mt-1 font-bold text-blue-600">
            {formatDistanceKm(
              suggestion.differenceMeters,
            )}
          </Text>
        </View>
      </View>

      <View className="mt-4 items-center rounded-2xl bg-blue-600 py-3">
        <Text className="font-bold text-white">
          {t("Vælg denne rute")}
        </Text>
      </View>
    </Pressable>
  );
}