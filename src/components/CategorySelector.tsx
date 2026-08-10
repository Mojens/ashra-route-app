import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  ROUTE_CATEGORIES,
  ROUTE_CATEGORY_GROUPS,
} from "../constants";
import { RouteCategory } from "../types/route";

type MoveDirection = "left" | "right";

interface CategorySelectorProps {
  selectedCategories: RouteCategory[];
  availableCategories: RouteCategory[];
  isLoading?: boolean;
  onToggleCategory: (
    category: RouteCategory,
  ) => void;
  onMoveCategory: (
    category: RouteCategory,
    direction: MoveDirection,
  ) => void;
}

export default function CategorySelector({
  selectedCategories,
  availableCategories,
  isLoading = false,
  onToggleCategory,
  onMoveCategory,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const visibleCategories =
    ROUTE_CATEGORIES.filter((category) =>
      availableCategories.includes(
        category.id,
      ),
    );

  const visibleGroups =
    ROUTE_CATEGORY_GROUPS
      .map((group) => ({
        ...group,
        categories:
          visibleCategories.filter(
            (category) =>
              category.group === group.id,
          ),
      }))
      .filter(
        (group) =>
          group.categories.length > 0,
      );

  return (
    <View>
      <Text className="mb-3 text-base font-semibold text-slate-900">
        {t("Hvad skal ruten gå forbi?")}
      </Text>

      {isLoading && (
        <View className="mb-3 flex-row items-center">
          <ActivityIndicator size="small" />

          <Text className="ml-2 text-sm text-slate-500">
            {t("Finder steder i nærheden...")}
          </Text>
        </View>
      )}

      {!isLoading &&
        visibleGroups.length === 0 && (
          <View className="rounded-2xl bg-slate-50 p-4">
            <Text className="text-sm text-slate-500">
              {t(
                "Der blev ikke fundet nogen steder i nærheden.",
              )}
            </Text>
          </View>
        )}

      {!isLoading && visibleGroups.length > 0 && (
        <ScrollView
          style={{
            maxHeight: 300,
          }}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          {visibleGroups.map((group) => {
            const isExpanded =
              expandedGroupId === group.id;

            const selectedCount =
              group.categories.filter((category) =>
                selectedCategories.includes(
                  category.id,
                ),
              ).length;

            return (
              <View
                key={group.id}
                className="mb-2"
              >
                <Pressable
                  onPress={() =>
                    setExpandedGroupId(
                      isExpanded
                        ? null
                        : group.id,
                    )
                  }
                  className="flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 active:bg-slate-100"
                >
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-xl">
                      {group.icon}
                    </Text>

                    <View>
                      <Text className="font-semibold text-slate-800">
                        {t(group.label)}
                      </Text>

                      {selectedCount > 0 && (
                        <Text className="mt-0.5 text-xs font-medium text-blue-600">
                          {selectedCount}{" "}
                          {selectedCount === 1
                            ? t("valgt")
                            : t("valgte")}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text className="text-lg font-bold text-slate-500">
                    {isExpanded ? "⌃" : "⌄"}
                  </Text>
                </Pressable>

                {isExpanded && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerClassName="gap-2 pt-3"
                  >
                    {group.categories.map(
                      (category) => {
                        const selectedIndex =
                          selectedCategories.indexOf(
                            category.id,
                          );

                        const isSelected =
                          selectedIndex !== -1;

                        const isFirst =
                          selectedIndex === 0;

                        const isLast =
                          selectedIndex ===
                          selectedCategories.length - 1;

                        return (
                          <Pressable
                            key={category.id}
                            onPress={() =>
                              onToggleCategory(
                                category.id,
                              )
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
                                    {t("STOP")}{" "}
                                    {selectedIndex + 1}
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
                              {t(category.label)}
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
                      },
                    )}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {selectedCategories.length > 1 && (
        <Text className="mt-1 text-xs text-slate-500">
          {t(
            "Brug pilene til at ændre rækkefølgen på stoppene.",
          )}
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