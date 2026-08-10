import "./global.css";
import "./src/i18n";

import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}