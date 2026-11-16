import type { CharacterType } from "./types";

export interface CharacterInfo {
  label: string;
  color: string;
  badgeBg: string;
  tintBg: string;
}

export const CHARACTER_INFO: Record<CharacterType, CharacterInfo> = {
  boy: {
    label: "Shawarzilla",
    color: "#00ccff",
    badgeBg: "#00ccff",
    tintBg: "rgba(0,204,255,0.15)",
  },
  girl: {
    label: "Shawarpunzel",
    color: "#c850ff",
    badgeBg: "#c850ff",
    tintBg: "rgba(200,80,255,0.15)",
  },
  shawarminator: {
    label: "Shawarminator",
    color: "#ff3366",
    badgeBg: "#ff3366",
    tintBg: "rgba(255,51,102,0.15)",
  },
};
