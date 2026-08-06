import { Pressable, Text, View } from "react-native";

interface StepSelectorProps {
  selectedSteps: number;
  onSelectSteps: (steps: number) => void;
}

const STEP_OPTIONS = [5000, 7500, 10000, 15000];

export default function StepSelector({
  selectedSteps,
  onSelectSteps,
}: StepSelectorProps) {
  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-slate-900">
        Hvor langt vil du gå?
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
                className={
                  isSelected
                    ? "font-bold text-blue-600"
                    : "font-medium text-slate-700"
                }
              >
                {steps.toLocaleString("da-DK")}
              </Text>

              <Text
                className={
                  isSelected
                    ? "mt-1 text-xs text-blue-500"
                    : "mt-1 text-xs text-slate-400"
                }
              >
                skridt
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}