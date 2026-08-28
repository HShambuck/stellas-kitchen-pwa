import { COLORS, FONT_SIZES, SPACING, RADIUS, ORDER_STATUS, ORDER_STATUS_LABELS } from "../../constants/theme";

type Size = "sm" | "md";

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  [ORDER_STATUS.PENDING]: { bg: COLORS.pendingBg, text: "#92400E", dot: COLORS.pending },
  [ORDER_STATUS.PREPARING]: { bg: COLORS.preparingBg, text: "#1E40AF", dot: COLORS.preparing },
  [ORDER_STATUS.READY_FOR_PICKUP]: { bg: COLORS.readyBg, text: "#5B21B6", dot: COLORS.ready },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: { bg: COLORS.deliveryBg, text: "#9A3412", dot: COLORS.delivery },
  [ORDER_STATUS.DELIVERED]: { bg: COLORS.deliveredBg, text: "#14532D", dot: COLORS.delivered },
  Cancelled: { bg: COLORS.cancelledBg, text: "#991B1B", dot: COLORS.cancelled },
};

export default function StatusBadge({ status, size = "md" }: { status?: string; size?: Size }) {
  const style = (status && STATUS_STYLE[status]) || STATUS_STYLE[ORDER_STATUS.PENDING];
  const label = (status && ORDER_STATUS_LABELS[status]) || status || "Unknown";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: SPACING.xs,
        backgroundColor: style.bg,
        borderRadius: RADIUS.full,
        padding: size === "sm" ? `2px ${SPACING.sm}px` : `${SPACING.xs}px ${SPACING.md}px`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: style.dot }} />
      <span
        style={{
          fontSize: size === "sm" ? FONT_SIZES.xs : FONT_SIZES.sm,
          fontWeight: 600,
          color: style.text,
        }}
      >
        {label}
      </span>
    </span>
  );
}