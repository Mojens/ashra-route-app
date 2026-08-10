import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAppTranslation } from "../hooks/useAppTranslation";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { RootTabParamList } from "./types";

const Tab =
  createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const { t } = useAppTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: "#64748B",
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t("Rute"),
            tabBarIcon: ({ color }) => (
              <Text style={{ color }}>
                🗺️
              </Text>
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t("Indstillinger"),
            tabBarIcon: ({ color }) => (
              <Text style={{ color }}>
                ⚙️
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}