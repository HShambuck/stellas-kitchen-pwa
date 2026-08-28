import { type ReactNode, type CSSProperties } from "react";
import { COLORS, RADIUS, FONT_SIZES, SPACING } from "../../constants/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
}

const SIZE_PADDING: Record<Size, string> = {
  sm: `${SPACING.sm}px ${SPACING.lg}px`,
  md: `${SPACING.md}px ${SPACING["2xl"]}px`,
  lg: `${SPACING.lg}px ${SPACING["3xl"]}px`,
};

const LABEL_SIZE: Record<Size, number> = {
  sm: FONT_SIZES.sm,
  md: FONT_SIZES.base,
  lg: FONT_SIZES.md,
};

const VARIANT_STYLE: Record<Variant, CSSProperties> = {
  primary: { backgroundColor: COLORS.red, border: "none" },
  secondary: {
    backgroundColor: "transparent",
    border: `2px solid ${COLORS.red}`,
  },
  ghost: { backgroundColor: "transparent", border: "none" },
  danger: { backgroundColor: COLORS.redDark, border: "none" },
};

const LABEL_COLOR: Record<Variant, string> = {
  primary: COLORS.white,
  secondary: COLORS.red,
  ghost: COLORS.warm,
  danger: COLORS.white,
};

export default function Button({
  variant = "primary",
  size = "md",
  label,
  onClick,
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  labelStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        borderRadius: RADIUS.xl,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : undefined,
        padding: SIZE_PADDING[size],
        opacity: isDisabled ? 0.45 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s ease",
        ...VARIANT_STYLE[variant],
        ...style,
      }}
    >
      {loading ? (
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `2px solid ${variant === "primary" || variant === "danger" ? COLORS.white : COLORS.red}`,
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
      ) : (
        <span
          style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}
        >
          {icon && (
            <span style={{ marginRight: 2, display: "flex" }}>{icon}</span>
          )}
          <span
            style={{
              fontWeight: 700,
              letterSpacing: 0.2,
              fontSize: LABEL_SIZE[size],
              color: LABEL_COLOR[variant],
              ...labelStyle,
            }}
          >
            {label}
          </span>
        </span>
      )}
    </button>
  );
}
