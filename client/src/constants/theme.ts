export interface ThemeConfig {
  name: string;
  description: string;
  background: string;
  foreground: string;
  cardBg: string;
  cardBgRgb: string;
  cardBorder: string;
  cardBorderRgb: string;
  accent: string;
  accentRgb: string;
  accentHover: string;
  hoverBg: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  "sunset-crimson": {
    name: "Sunset Crimson",
    description: "Classic high-contrast dark gray and scarlet red.",
    background: "#050608",
    foreground: "#f3f4f6",
    cardBg: "#0f1015",
    cardBgRgb: "15, 16, 21",
    cardBorder: "#1f212a",
    cardBorderRgb: "31, 33, 42",
    accent: "#ff2e43",
    accentRgb: "255, 46, 67",
    accentHover: "#e02034",
    hoverBg: "#2b2e3b"
  },
  "midnight-indigo": {
    name: "Midnight Indigo",
    description: "Deep cyberspace violet with electric indigo accents.",
    background: "#030712",
    foreground: "#f3f4f6",
    cardBg: "#0f172a",
    cardBgRgb: "15, 23, 42",
    cardBorder: "#1e293b",
    cardBorderRgb: "30, 41, 59",
    accent: "#818cf8",
    accentRgb: "129, 140, 248",
    accentHover: "#6366f1",
    hoverBg: "#334155"
  },
  "emerald-forest": {
    name: "Emerald Forest",
    description: "Soothing deep jade green with vibrant emerald accents.",
    background: "#022c22",
    foreground: "#f0fdf4",
    cardBg: "#064e3b",
    cardBgRgb: "6, 78, 59",
    cardBorder: "#115e59",
    cardBorderRgb: "17, 94, 89",
    accent: "#10b981",
    accentRgb: "16, 185, 129",
    accentHover: "#059669",
    hoverBg: "#134e4a"
  },
  "sakura-blossom": {
    name: "Sakura Blossom",
    description: "Sweet dark rosewood with soft cherry blossom pink.",
    background: "#180f12",
    foreground: "#fdf2f8",
    cardBg: "#271d22",
    cardBgRgb: "39, 29, 34",
    cardBorder: "#4c1d33",
    cardBorderRgb: "76, 29, 51",
    accent: "#ec4899",
    accentRgb: "236, 72, 153",
    accentHover: "#db2777",
    hoverBg: "#5c2a41"
  },
  "oceanic-abyss": {
    name: "Oceanic Abyss",
    description: "Abyssal navy depths with glowing cyan coordinates.",
    background: "#020813",
    foreground: "#ecfeff",
    cardBg: "#0b132b",
    cardBgRgb: "11, 19, 43",
    cardBorder: "#1c2541",
    cardBorderRgb: "28, 37, 65",
    accent: "#0ea5e9",
    accentRgb: "14, 165, 233",
    accentHover: "#0284c7",
    hoverBg: "#3a506b"
  }
};
