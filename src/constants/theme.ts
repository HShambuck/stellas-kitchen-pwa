// ─── Stella's Kitchen PWA — Design Token Registry (v2) ─────────────────────
// Brand + status colors are UNCHANGED from v1. Only the neutral/surface
// scale and elevation system were revised for contrast and depth.

export const COLORS = {
  // Brand — unchanged
  red: "#EF4444",
  redDark: "#DC2626",
  redLight: "#FEE2E2",
  white: "#FFFFFF",

  // Status — unchanged
  pending: "#F59E0B",
  pendingBg: "#FEF3C7",
  preparing: "#3B82F6",
  preparingBg: "#DBEAFE",
  ready: "#8B5CF6",
  readyBg: "#EDE9FE",
  delivery: "#F97316",
  deliveryBg: "#FFEDD5",
  delivered: "#22C55E",
  deliveredBg: "#DCFCE7",
  cancelled: "#EF4444",
  cancelledBg: "#FEE2E2",

  // ── Dark neutral scale — cooler slate instead of warm brown-black ──────
  // Old `dark`/`stone`/`warm`/`border` were brown-tinted (#1C1917 family),
  // which read as murky rather than crisp. This is a standard slate scale,
  // same family Linear/Vercel/GitHub dark mode use.
  slate950: "#0B0D12", // page background
  slate900: "#12151C", // alternate/recessed surface
  slate800: "#1C212B", // card surface
  slate700: "#262C38", // elevated card / modal surface (sits above slate800)
  slate600: "#343B49", // subtle border (default)
  slate500: "#4B5262", // strong border (dividers that need to actually read)
  slate400: "#8A93A3", // muted text
  slate300: "#B7BECB", // faint/placeholder text — kept light enough to read

  // ── Light neutral scale — same warm-cream family, contrast boosted ─────
  cream50: "#FAF7F2",  // page background (was #F5F1EB, slightly cooled)
  cream0: "#FFFFFF",   // card surface
  inputTint: "#F7F3EC", // input fill, distinguishable from card white
  warmBorder: "#D9D2C4", // default border — was #E5E0D8, too close to white
  warmBorderStrong: "#C7BEAC", // dividers that need real presence
  warmText: "#171412",   // primary text
  warmTextMuted: "#6B645C", // was #78716C — darkened slightly for AA contrast
  warmTextFaint: "#9C948A",
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  "2xl": 26,
  "3xl": 32,
  "4xl": 40,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 56,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

export const BRAND = {
  name: "Stella's Kitchen",
  tagline: "Eat Good, Feel Good",
  location: "Shai Hills, Ghana",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Dispatch",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PREPARING]: "Preparing",
  [ORDER_STATUS.READY_FOR_PICKUP]: "Ready for Dispatch",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
};

export const ROLES = {
  STAFF: "Staff",
  RIDER: "Rider",
};

export const VEHICLE_TYPES = [
  { value: "motorbike", label: "Motorbike" },
  { value: "bicycle", label: "Bicycle" },
  { value: "van", label: "Van" },
  { value: "on_foot", label: "On Foot" },
];

// ─── Theme Token Sets ───────────────────────────────────────────────────────
export interface ThemeTokens {
  bg: string;
  card: string;
  cardElevated: string;   // for modals/sheets that need to sit above cards
  border: string;         // default, subtle dividers
  borderStrong: string;   // dividers/inputs that need real definition
  text: string;
  textMuted: string;
  textFaint: string;
  tabBar: string;
  tabBorder: string;
  inputBg: string;
  pillActive: string;
  shadowSm: string;
  shadowMd: string;
}

export const DARK_THEME: ThemeTokens = {
  bg: COLORS.slate950,
  card: COLORS.slate800,
  cardElevated: COLORS.slate700,
  border: COLORS.slate600,
  borderStrong: COLORS.slate500,
  text: COLORS.white,
  textMuted: COLORS.slate400,
  textFaint: "#6B7280",
  tabBar: COLORS.slate900,
  tabBorder: COLORS.slate600,
  inputBg: COLORS.slate700,
  pillActive: "#1E3A5F",
  shadowSm: "0 1px 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
  shadowMd: "0 8px 24px rgba(0,0,0,0.5)",
};

export const LIGHT_THEME: ThemeTokens = {
  bg: COLORS.cream50,
  card: COLORS.cream0,
  cardElevated: COLORS.cream0,
  border: COLORS.warmBorder,
  borderStrong: COLORS.warmBorderStrong,
  text: COLORS.warmText,
  textMuted: COLORS.warmTextMuted,
  textFaint: COLORS.warmTextFaint,
  tabBar: COLORS.cream0,
  tabBorder: COLORS.warmBorder,
  inputBg: COLORS.inputTint,
  pillActive: COLORS.redLight,
  shadowSm: "0 1px 2px rgba(23,20,18,0.05), 0 1px 3px rgba(23,20,18,0.06)",
  shadowMd: "0 8px 24px rgba(23,20,18,0.10)",
};