import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ROUTE_CATEGORIES } from "../constants";
import { RouteCategory } from "../types/route";


type MoveDirection = "left" | "right";

interface CategorySelectorProps {
  selectedCategories: RouteCategory[];
  onToggleCategory: (category: RouteCategory) => void;
  onMoveCategory: (
    category: RouteCategory,
    direction: MoveDirection,
  ) => void;
}

export default function CategorySelector({
  selectedCategories,
  onToggleCategory,
  onMoveCategory,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-slate-900">
        {t("Hvad skal ruten gå forbi?")}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {ROUTE_CATEGORIES.map((category) => {
          const selectedIndex =
            selectedCategories.indexOf(category.id);

          const isSelected = selectedIndex !== -1;
          const isFirst = selectedIndex === 0;
          const isLast =
            selectedIndex ===
            selectedCategories.length - 1;

          return (
            <Pressable
              key={category.id}
              onPress={() =>
                onToggleCategory(category.id)
              }
              className={[
                "min-w-[120px] rounded-2xl border p-3",
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <View className="flex-row items-start justify-between">
                <Text className="text-2xl">
                  {category.icon}
                </Text>

                {isSelected && (
                  <View className="rounded-full bg-blue-600 px-2 py-1">
                    <Text className="text-[10px] font-bold text-white">
                      {t("STOP")} {selectedIndex + 1}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className={[
                  "mt-2 text-sm",
                  isSelected
                    ? "font-semibold text-blue-700"
                    : "font-medium text-slate-700",
                ].join(" ")}
              >
                {category.label}
              </Text>

              {isSelected &&
                selectedCategories.length > 1 && (
                  <View className="mt-3 flex-row gap-2">
                    <MoveButton
                      symbol="←"
                      disabled={isFirst}
                      onPress={() =>
                        onMoveCategory(
                          category.id,
                          "left",
                        )
                      }
                    />

                    <MoveButton
                      symbol="→"
                      disabled={isLast}
                      onPress={() =>
                        onMoveCategory(
                          category.id,
                          "right",
                        )
                      }
                    />
                  </View>
                )}
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedCategories.length > 1 && (
        <Text className="mt-2 text-xs text-slate-500">
          {t("Brug pilene til at ændre rækkefølgen på stoppene.")}
        </Text>
      )}
    </View>
  );
}

interface MoveButtonProps {
  symbol: string;
  disabled: boolean;
  onPress: () => void;
}

function MoveButton({
  symbol,
  disabled,
  onPress,
}: MoveButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      className={[
        "flex-1 items-center rounded-lg py-1.5",
        disabled
          ? "bg-slate-100"
          : "bg-white active:bg-slate-100",
      ].join(" ")}
    >
      <Text
        className={
          disabled
            ? "font-bold text-slate-300"
            : "font-bold text-blue-600"
        }
      >
        {symbol}
      </Text>
    </Pressable>
  );
}