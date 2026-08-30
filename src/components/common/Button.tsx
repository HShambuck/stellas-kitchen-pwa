import { type ReactNode, type CSSProperties } from "react";
import { COLORS, RADIUS, FONT_SIZES, SPACING, DARK_THEME, LIGHT_THEME } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

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
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const isDisabled = disabled || loading;

  // Disabled treatment: a real muted neutral fill instead of flat opacity
  // over a saturated color, which previously turned red into washed pink.
  const variantStyle: CSSProperties = isDisabled
    ? {
        backgroundColor:
          variant === "secondary" || variant === "ghost" ? "transparent" : theme.border,
        border: variant === "secondary" ? `2px solid ${theme.border}` : "none",
      }
    : ({
        primary: { backgroundColor: COLORS.red, border: "none", boxShadow: theme.shadowSm },
        secondary: { backgroundColor: "transparent", border: `2px solid ${COLORS.red}` },
        ghost: { backgroundColor: "transparent", border: "none" },
        danger: { backgroundColor: COLORS.redDark, border: "none", boxShadow: theme.shadowSm },
      }[variant] as CSSProperties);

  const labelColor = isDisabled
    ? theme.textFaint
    : { primary: COLORS.white, secondary: COLORS.red, ghost: theme.textMuted, danger: COLORS.white }[
        variant
      ];

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
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s ease, background-color 0.15s ease",
        ...variantStyle,
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
        <span style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
          {icon && <span style={{ marginRight: 2, display: "flex" }}>{icon}</span>}
          <span
            style={{
              fontWeight: 700,
              letterSpacing: 0.2,
              fontSize: LABEL_SIZE[size],
              color: labelColor,
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