import { useCallback, useEffect, useState } from "react";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import OrderCard from "../../components/orders/OrderCard";
import StatusBadge from "../../components/orders/StatusBadge";
import { getPendingOrders, updateOrderStatus } from "../../api/orders";
import {
  COLORS,
  DARK_THEME,
  FONT_SIZES,
  LIGHT_THEME,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  RADIUS,
  SPACING,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const DISPATCHED_STATUSES = [
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

function isToday(isoString?: string) {
  if (!isoString) return false;
  return new Date(isoString).toDateString() === new Date().toDateString();
}

const STAFF_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_PICKUP],
  [ORDER_STATUS.READY_FOR_PICKUP]: [],
};

interface Order {
  _id?: string;
  id?: string;
  statusState: string;
  customerName?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  totalPrice?: number;
  createdAt?: string;
  timestamp?: string;
  items?: { foodItemName: string; quantity?: number; price?: number }[];
}

function SummaryPill({
  label,
  count,
  color,
  theme,
}: {
  label: string;
  count: number;
  color: string;
  theme: typeof DARK_THEME;
}) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: RADIUS.lg,
        border: `1.5px solid ${color}`,
        padding: SPACING.md,
        textAlign: "center",
        backgroundColor: theme.card,
      }}
    >
      <div style={{ fontSize: FONT_SIZES["2xl"], fontWeight: 800, color }}>
        {count}
      </div>
      <div
        style={{
          fontSize: FONT_SIZES.xs,
          marginTop: 2,
          color: theme.textMuted,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  theme,
}: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  theme: typeof DARK_THEME;
}) {
  const [loading, setLoading] = useState(false);
  if (!order) return null;

  const transitions = STAFF_TRANSITIONS[order.statusState] ?? [];

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusChange((order._id || order.id) as string, newStatus);
      onClose();
    } catch (e: any) {
      window.alert(e.message || "Could not update order status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={sheetStyle(theme)} onClick={(e) => e.stopPropagation()}>
        <div style={handleStyle(theme)} />
        <h2
          style={{
            fontSize: FONT_SIZES.xl,
            fontWeight: 800,
            marginBottom: SPACING.sm,
            letterSpacing: 1,
            color: theme.text,
          }}
        >
          Order #
          {String(order._id || order.id)
            .slice(-5)
            .toUpperCase()}
        </h2>

        {[
          { label: "Customer", value: order.customerName },
          { label: "Address", value: order.deliveryAddress },
        ].map(({ label, value }) => (
          <div key={label} style={modalRowStyle(theme)}>
            <span
              style={{
                fontSize: FONT_SIZES.sm,
                fontWeight: 600,
                color: theme.textMuted,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: FONT_SIZES.sm,
                fontWeight: 600,
                color: theme.text,
                textAlign: "right",
                flex: 1,
                marginLeft: SPACING.md,
              }}
            >
              {value}
            </span>
          </div>
        ))}

        <div style={modalRowStyle(theme)}>
          <span
            style={{
              fontSize: FONT_SIZES.sm,
              fontWeight: 600,
              color: theme.textMuted,
            }}
          >
            Status
          </span>
          <StatusBadge status={order.statusState} />
        </div>

        <div
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: 600,
            marginTop: SPACING.lg,
            color: theme.textMuted,
          }}
        >
          Items
        </div>
        {(order.items || []).map((item) => (
          <div
            key={item.foodItemName}
            style={{
              display: "flex",
              alignItems: "center",
              padding: `${SPACING.xs}px 0`,
              gap: SPACING.sm,
            }}
          >
            <span style={{ color: COLORS.red, fontWeight: 700, width: 24 }}>
              {item.quantity}×
            </span>
            <span
              style={{ flex: 1, fontSize: FONT_SIZES.sm, color: theme.text }}
            >
              {item.foodItemName}
            </span>
            <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>
              GHS {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
            </span>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: SPACING.md,
            marginTop: SPACING.xs,
          }}
        >
          <span style={{ fontWeight: 700, color: theme.textMuted }}>Total</span>
          <span
            style={{
              color: COLORS.red,
              fontWeight: 800,
              fontSize: FONT_SIZES.md,
            }}
          >
            GHS {Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
          </span>
        </div>

        {transitions.length > 0 && (
          <div style={{ marginTop: SPACING.xl }}>
            {transitions.map((s) => (
              <Button
                key={s}
                label={`Mark as ${ORDER_STATUS_LABELS[s]}`}
                loading={loading}
                onClick={() => handleUpdate(s)}
                size="md"
                style={{ marginTop: SPACING.sm }}
              />
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          label="Close"
          onClick={onClose}
          size="sm"
          style={{ marginTop: SPACING.md }}
        />
      </div>
    </div>
  );
}

function DispatchedModal({
  orders,
  visible,
  onClose,
  theme,
}: {
  orders: Order[];
  visible: boolean;
  onClose: () => void;
  theme: typeof DARK_THEME;
}) {
  if (!visible) return null;
  const dispatched = orders.filter(
    (o) =>
      DISPATCHED_STATUSES.includes(o.statusState as any) &&
      isToday(o.createdAt || o.timestamp),
  );

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div
        style={{ ...sheetStyle(theme), maxHeight: "80%", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={handleStyle(theme)} />
        <h2
          style={{
            fontSize: FONT_SIZES.xl,
            fontWeight: 800,
            marginBottom: SPACING.sm,
            letterSpacing: 1,
            color: theme.text,
          }}
        >
          📦 Dispatched Today
        </h2>
        <p
          style={{
            fontSize: FONT_SIZES.xs,
            lineHeight: "17px",
            marginBottom: SPACING.md,
            color: theme.textMuted,
          }}
        >
          Out for delivery & delivered — resets at midnight
        </p>

        {dispatched.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: `${SPACING["4xl"]}px 0`,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: SPACING.lg }}>🏍️</div>
            <div
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              No dispatched orders yet
            </div>
            <div
              style={{
                fontSize: FONT_SIZES.sm,
                marginTop: SPACING.xs,
                color: theme.textMuted,
              }}
            >
              Orders handed to riders will appear here
            </div>
          </div>
        ) : (
          dispatched.map((order) => (
            <div
              key={String(order._id || order.id)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: `${SPACING.sm}px 0`,
                borderBottom: `1px solid ${theme.border}`,
                gap: SPACING.sm,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: FONT_SIZES.sm,
                    fontWeight: 700,
                    color: theme.text,
                  }}
                >
                  #
                  {String(order._id || order.id)
                    .slice(-5)
                    .toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: FONT_SIZES.xs,
                    marginTop: 2,
                    color: theme.textMuted,
                  }}
                >
                  {order.customerName}
                </div>
              </div>
              <StatusBadge status={order.statusState} />
            </div>
          ))
        )}

        <Button
          variant="ghost"
          label="Close"
          onClick={onClose}
          size="sm"
          style={{ marginTop: SPACING.lg }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [showDispatched, setShowDispatched] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getPendingOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    const onVisible = () =>
      document.visibilityState === "visible" && fetchOrders();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatus(id, status as any);
    await fetchOrders();
  };

  const FILTERS = [
    "ALL",
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY_FOR_PICKUP,
  ];
  const ACTIVE_STATUSES = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY_FOR_PICKUP,
  ];
  const filtered =
    filter === "ALL"
      ? orders.filter((o) => ACTIVE_STATUSES.includes(o.statusState as any))
      : orders.filter((o) => o.statusState === filter);

  const counts = {
    pending: orders.filter((o) => o.statusState === ORDER_STATUS.PENDING)
      .length,
    preparing: orders.filter((o) => o.statusState === ORDER_STATUS.PREPARING)
      .length,
    ready: orders.filter((o) => o.statusState === ORDER_STATUS.READY_FOR_PICKUP)
      .length,
  };

  const dispatchedCount = orders.filter(
    (o) =>
      DISPATCHED_STATUSES.includes(o.statusState as any) &&
      isToday(o.createdAt || o.timestamp),
  ).length;

  const confirmSignOut = () => {
    if (window.confirm("Sign Out — are you sure?")) signOut();
  };

  return (
    <SafeView
      variant={isDark ? "dark" : "light"}
      edges={["top", "left", "right"]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${SPACING.xl}px ${SPACING["2xl"]}px ${SPACING.lg}px`,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: 800,
              color: theme.text,
              margin: 0,
            }}
          >
            Kitchen Dashboard
          </h1>
          <p
            style={{
              fontSize: FONT_SIZES.sm,
              marginTop: 2,
              color: theme.textMuted,
              margin: "2px 0 0",
            }}
          >
            Welcome back, {user?.name?.split(" ")[0]}!
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: SPACING.xs,
          }}
        >
          <button
            onClick={() => setShowDispatched(true)}
            style={{
              padding: `${SPACING.xs}px ${SPACING.md}px`,
              borderRadius: RADIUS.full,
              border: `1px solid ${COLORS.delivery}`,
              background: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: FONT_SIZES.xs,
                fontWeight: 600,
                color: COLORS.delivery,
              }}
            >
              📦 Dispatched{dispatchedCount > 0 ? ` (${dispatchedCount})` : ""}
            </span>
          </button>
          <button
            onClick={confirmSignOut}
            style={{
              padding: `${SPACING.xs}px ${SPACING.md}px`,
              borderRadius: RADIUS.full,
              border: `1px solid ${theme.border}`,
              background: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: FONT_SIZES.xs,
                fontWeight: 600,
                color: theme.textMuted,
              }}
            >
              Sign Out
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: SPACING.sm,
          padding: `0 ${SPACING["2xl"]}px`,
          marginBottom: SPACING.lg,
        }}
      >
        <SummaryPill
          label="Pending"
          count={counts.pending}
          color={COLORS.pending}
          theme={theme}
        />
        <SummaryPill
          label="Preparing"
          count={counts.preparing}
          color={COLORS.preparing}
          theme={theme}
        />
        <SummaryPill
          label="Ready"
          count={counts.ready}
          color={COLORS.ready}
          theme={theme}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: SPACING.xs,
          padding: `0 ${SPACING["2xl"]}px`,
          marginBottom: SPACING.lg,
          flexWrap: "wrap",
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: `${SPACING.xs}px ${SPACING.md}px`,
                borderRadius: RADIUS.full,
                border: `1px solid ${active ? COLORS.red : theme.border}`,
                backgroundColor: active ? COLORS.red : theme.card,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: FONT_SIZES.xs,
                  fontWeight: 600,
                  color: active ? COLORS.white : theme.textMuted,
                }}
              >
                {f === "ALL" ? "All" : ORDER_STATUS_LABELS[f]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingLeft: SPACING["2xl"],
          paddingRight: SPACING["2xl"],
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: SPACING["4xl"],
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: `3px solid ${COLORS.red}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: `${SPACING["4xl"]}px 0`,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: SPACING.lg }}>🍽️</div>
            <div
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              No orders yet
            </div>
            <div
              style={{
                fontSize: FONT_SIZES.sm,
                marginTop: SPACING.xs,
                color: theme.textFaint,
              }}
            >
              Pull to refresh
            </div>
          </div>
        ) : (
          filtered.map((item) => (
            <OrderCard
              key={String(item._id || item.id)}
              order={item as any}
              variant={isDark ? "dark" : "light"}
              onClick={() => setSelectedOrder(item)}
            />
          ))
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        theme={theme}
      />
      <DispatchedModal
        orders={orders}
        visible={showDispatched}
        onClose={() => setShowDispatched(false)}
        theme={theme}
      />
    </SafeView>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 50,
};

function sheetStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    width: "100%",
    maxWidth: 480,
    backgroundColor: theme.card,
    border: `1px solid ${theme.border}`,
    borderTopLeftRadius: RADIUS["3xl"],
    borderTopRightRadius: RADIUS["3xl"],
    padding: SPACING["2xl"],
    paddingBottom: SPACING["4xl"],
  };
}

function handleStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    margin: "0 auto",
    marginBottom: SPACING.xl,
  };
}

function modalRowStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${SPACING.sm}px 0`,
    borderBottom: `1px solid ${theme.border}`,
  };
}
