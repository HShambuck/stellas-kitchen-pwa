import { COLORS, FONT_SIZES, SPACING, RADIUS, ORDER_STATUS, DARK_THEME, LIGHT_THEME } from "../../constants/theme";
import StatusBadge from "./StatusBadge";

interface OrderItem {
  foodItemName?: string;
  name?: string;
  quantity?: number;
}

interface Order {
  _id?: string;
  id?: string;
  statusState?: string;
  status?: string;
  customerName?: string;
  deliveryAddress?: string;
  tableNumber?: string | number;
  totalAmount?: number;
  totalPrice?: number;
  createdAt?: string;
  items?: OrderItem[];
}

export default function OrderCard({
  order,
  onClick,
  variant = "light",
}: {
  order: Order;
  onClick?: () => void;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const itemCount = order.items?.length ?? 0;
  const itemSummary =
    itemCount === 0
      ? "No items"
      : (order.items ?? [])
          .slice(0, 2)
          .map((i) => `${i.foodItemName || i.name || "Item"} (${i.quantity})`)
          .join(", ") + (itemCount > 2 ? ` +${itemCount - 2} more` : "");

  const timeAgo = formatTimeAgo(order.createdAt);
  const status = order.statusState || order.status;

  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        textAlign: "left",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: RADIUS["2xl"],
        padding: SPACING["2xl"],
        marginBottom: SPACING.md,
        backgroundColor: theme.card,
        border: `1px solid ${theme.borderStrong}`,
        boxShadow: theme.shadowSm,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
          <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, letterSpacing: 1, color: theme.text }}>
            #{String(order._id || order.id).slice(-4).toUpperCase()}
          </span>
          <span style={{ fontSize: FONT_SIZES.xs, color: theme.textMuted }}>{timeAgo}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div style={{ fontSize: FONT_SIZES.md, fontWeight: 700, marginBottom: SPACING.xs, color: theme.text }}>
        {order.customerName || "Web Customer"}
      </div>

      <div style={{ marginBottom: SPACING.md }}>
        <span
          style={{
            fontSize: FONT_SIZES.sm,
            color: theme.textMuted,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {itemSummary}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: FONT_SIZES.xs,
            color: theme.textMuted,
            flex: 1,
            marginRight: SPACING.sm,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          📍 {order.deliveryAddress || (order.tableNumber ? `Table ${order.tableNumber}` : "In-Kitchen")}
        </span>
        <span style={{ fontSize: FONT_SIZES.base, fontWeight: 700, color: COLORS.red }}>
          GHS {Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: SPACING.lg,
          bottom: SPACING.lg,
          width: 4,
          borderRadius: RADIUS.full,
          backgroundColor: getAccentColor(status),
        }}
      />
    </button>
  );
}

function getAccentColor(status?: string) {
  const map: Record<string, string> = {
    [ORDER_STATUS.PENDING]: COLORS.pending,
    [ORDER_STATUS.PREPARING]: COLORS.preparing,
    [ORDER_STATUS.READY_FOR_PICKUP]: COLORS.ready,
    [ORDER_STATUS.OUT_FOR_DELIVERY]: COLORS.delivery,
    [ORDER_STATUS.DELIVERED]: COLORS.delivered,
  };
  return (status && map[status]) ?? COLORS.pending;
}

function formatTimeAgo(isoString?: string) {
  if (!isoString) return "";
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}