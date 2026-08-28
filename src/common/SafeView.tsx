import { type ReactNode, type CSSProperties } from "react";
import { COLORS } from "../constants/theme";

type Variant = "dark" | "light" | "white" | "transparent";
type Edge = "top" | "bottom" | "left" | "right";

interface SafeViewProps {
  children: ReactNode;
  variant?: Variant;
  edges?: Edge[];
  style?: CSSProperties;
}

const BG_MAP: Record<Variant, string> = {
  dark: COLORS.dark,
  light: COLORS.cream,
  white: COLORS.white,
  transparent: "transparent",
};

export default function SafeView({
  children,
  variant = "light",
  edges = ["top", "bottom", "left", "right"],
  style,
}: SafeViewProps) {
  const backgroundColor = BG_MAP[variant] ?? COLORS.cream;

  const insetPadding: CSSProperties = {
    paddingTop: edges.includes("top") ? "env(safe-area-inset-top)" : 0,
    paddingBottom: edges.includes("bottom") ? "env(safe-area-inset-bottom)" : 0,
    paddingLeft: edges.includes("left") ? "env(safe-area-inset-left)" : 0,
    paddingRight: edges.includes("right") ? "env(safe-area-inset-right)" : 0,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        ...insetPadding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}