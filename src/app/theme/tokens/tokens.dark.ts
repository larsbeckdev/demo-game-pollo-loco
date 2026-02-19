export const tokensDark = {
  radii: {
    sm: "8px",
    md: "10px",
    lg: "14px",
    xl: "18px",
    pill: "999px",
  },

  space: {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "16px",
    xl: "20px",
    "2xl": "28px",
  },

  font: {
    familyBody:
      '"Geist Variable", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    familyHeading:
      '"Geist Variable", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    sizeSm: "12px",
    sizeMd: "14px",
    sizeLg: "18px",
    sizeXl: "20px",
    weightRegular: "400",
    weightSemibold: "600",
    weightBold: "800",
    weightBlack: "900",
  },

  colors: {
    /* Brand */
    primary: "#f97316",
    primaryHover: "#fdba74",
    primaryPressed: "#c2410c",

    /* Text */
    textBase: "#f1f5f9",
    textMuted: "#94a3b8",
    textDisabled: "#64748b",

    /* Surfaces */
    bodyBg: "#0a0a0b",
    cardBg: "#141417",
    cardBgElevated: "#1c1c21",
    panelBg: "rgba(20,20,23,0.88)",

    /* Borders */
    border: "#26262b",
    borderStrong: "#3f3f46",

    /* Overlay / Focus */
    overlayBg: "rgba(0,0,0,0.55)",
    focusRing: "rgba(249,115,22,0.45)",

    /* Chips */
    typeChipBg: "rgba(255,255,255,0.06)",
    typeChipBorder: "rgba(255,255,255,0.10)",

    /* Shadows */
    shadowSm: "0 10px 28px rgba(0,0,0,0.35)",
    shadowMd: "0 20px 60px rgba(0,0,0,0.45)",

    /* Cards */
    cardGradientTo: "rgba(255,255,255,0.06)",

    /* Component helpers */
    cardBorder: "rgba(255,255,255,0.12)",
    cardBorderHover: "rgba(255,255,255,0.20)",
    cardShadowHover: "0 14px 35px rgba(0,0,0,0.25)",

    /* Pokemon images */
    imgDropShadow: "0 10px 18px rgba(0,0,0,0.35)",
    imgDropShadowStrong: "0 12px 28px rgba(0,0,0,0.55)",
  },
} as const;

export type TokensDark = typeof tokensDark;
