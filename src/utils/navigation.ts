import { TFunction } from "i18next";
import {
  NavigationInstruction,
  NavigationManeuver,
} from "../types/route";

export function getNavigationInstructionText(
  instruction: NavigationInstruction,
  t: TFunction,
): string {
  switch (instruction.maneuver) {
    case "left":
      return t("Drej til venstre");

    case "right":
      return t("Drej til højre");

    case "sharp-left":
      return t("Drej skarpt til venstre");

    case "sharp-right":
      return t("Drej skarpt til højre");

    case "slight-left":
      return t("Hold let til venstre");

    case "slight-right":
      return t("Hold let til højre");

    case "straight":
      return t("Fortsæt ligeud");

    case "roundabout":
      return t("Gå ind i rundkørslen");

    case "exit-roundabout":
      return t("Forlad rundkørslen");

    case "u-turn":
      return t("Vend om");

    case "arrive":
      return t("Du er fremme");

    case "depart":
      return t("Start ruten");

    case "keep-left":
      return t("Hold til venstre");

    case "keep-right":
      return t("Hold til højre");

    default:
      return instruction.instruction;
  }
}

export function getManeuverIcon(
  maneuver: NavigationManeuver,
): string {
  switch (maneuver) {
    case "left":
      return "←";

    case "right":
      return "→";

    case "sharp-left":
      return "↙";

    case "sharp-right":
      return "↘";

    case "slight-left":
      return "↖";

    case "slight-right":
      return "↗";

    case "straight":
      return "↑";

    case "roundabout":
      return "↻";

    case "exit-roundabout":
      return "↗";

    case "u-turn":
      return "↩";

    case "arrive":
      return "✓";

    case "depart":
      return "↑";

    case "keep-left":
      return "↖";

    case "keep-right":
      return "↗";

    default:
      return "↑";
  }
}