export const tokensLight = {
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
    primaryHover: "#fb923c",
    primaryPressed: "#ea580c",

    /* Text */
    textBase: "#020617",
    textMuted: "#334155",
    textDisabled: "#64748b",

    /* Surfaces */
    bodyBg: "#f1f5f9",
    cardBg: "#ffffff",
    cardBgElevated: "#f8fafc",
    panelBg: "rgba(255,255,255,0.92)",

    /* Borders */
    border: "#cbd5e1",
    borderStrong: "#94a3b8",

    /* Overlay / Focus */
    overlayBg: "rgba(2,6,23,0.40)",
    focusRing: "rgba(249,115,22,0.35)",

    /* Chips */
    typeChipBg: "rgba(2,6,23,0.04)",
    typeChipBorder: "rgba(2,6,23,0.10)",

    /* Shadows */
    shadowSm: "0 10px 28px rgba(2,6,23,0.10)",
    shadowMd: "0 20px 60px rgba(2,6,23,0.16)",

    /* Cards */
    cardGradientTo: "rgba(2,6,23,0.04)",

    /* Component helpers */
    cardBorder: "rgba(2,6,23,0.10)",
    cardBorderHover: "rgba(2,6,23,0.16)",
    cardShadowHover: "0 14px 35px rgba(2,6,23,0.14)",

    /* Pokemon images */
    imgDropShadow: "0 10px 18px rgba(2,6,23,0.18)",
    imgDropShadowStrong: "0 12px 28px rgba(2,6,23,0.22)",
  },
} as const;

export type TokensLight = typeof tokensLight;
