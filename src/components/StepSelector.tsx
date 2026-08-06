import { Pressable, Text, View } from "react-native";
import { STEP_OPTIONS } from "../constants";
import { useTranslation } from "react-i18next";

interface StepSelectorProps {
  selectedSteps: number;
  onSelectSteps: (steps: number) => void;
}

export default function StepSelector({
  selectedSteps,
  onSelectSteps,
}: StepSelectorProps) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-slate-900">
        {t("Hvor langt vil du gå?")}
      </Text>

      <View className="flex-row gap-2">
        {STEP_OPTIONS.map((steps) => {
          const isSelected = selectedSteps === steps;

          return (
            <Pressable
              key={steps}
              onPress={() => onSelectSteps(steps)}
              className={[
                "flex-1 items-center rounded-xl border px-2 py-3",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-sm",
                  isSelected
                    ? "font-bold text-blue-600"
                    : "font-medium text-slate-700",
                ].join(" ")}
              >
                {steps.toLocaleString("da-DK")}
              </Text>

              <Text
                className={[
                  "mt-1 text-xs",
                  isSelected
                    ? "text-blue-500"
                    : "text-slate-400",
                ].join(" ")}
              >
                {t("skridt")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}