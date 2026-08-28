import { useCallback, useEffect, useState } from "react";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import OrderCard from "../../components/orders/OrderCard";
import { acceptDelivery, getAvailableDeliveries } from "../../api/orders";
import {
  COLORS,
  DARK_THEME,
  FONT_SIZES,
  LIGHT_THEME,
  RADIUS,
  SPACING,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface Order {
  _id?: string;
  id?: string;
  deliveryAddress?: string;
  customerName?: string;
  totalAmount?: number;
  totalPrice?: number;
  items?: { quantity?: number; foodItemName?: string; name?: string }[];
}

function DeliveryDetailModal({
  order,
  onClose,
  onAccept,
  accepting,
  theme,
}: {
  order: Order | null;
  onClose: () => void;
  onAccept: (id: string) => void;
  accepting: boolean;
  theme: typeof DARK_THEME;
}) {
  if (!order) return null;
  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={sheetStyle(theme)} onClick={(e) => e.stopPropagation()}>
        <div style={handleStyle(theme)} />
        <h2
          style={{
            fontSize: FONT_SIZES.xl,
            fontWeight: 800,
            marginBottom: SPACING.xl,
            color: theme.text,
          }}
        >
          Delivery Details
        </h2>

        {[
          { label: "📍 Drop-off", value: order.deliveryAddress },
          { label: "👤 Customer", value: order.customerName },
        ].map(({ label, value }) => (
          <div key={label} style={detailCardStyle(theme)}>
            <div
              style={{
                fontSize: FONT_SIZES.xs,
                fontWeight: 600,
                marginBottom: 4,
                color: theme.textMuted,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: FONT_SIZES.base,
                lineHeight: "22px",
                color: theme.text,
              }}
            >
              {value}
            </div>
          </div>
        ))}

        <div style={detailCardStyle(theme)}>
          <div
            style={{
              fontSize: FONT_SIZES.xs,
              fontWeight: 600,
              marginBottom: 4,
              color: theme.textMuted,
            }}
          >
            🛍️ Items
          </div>
          <div
            style={{
              fontSize: FONT_SIZES.base,
              lineHeight: "22px",
              whiteSpace: "pre-line",
              color: theme.text,
            }}
          >
            {(order.items || [])
              .map((i) => `${i.quantity}× ${i.foodItemName || i.name}`)
              .join("\n")}
          </div>
        </div>

        <div style={detailCardStyle(theme)}>
          <div
            style={{
              fontSize: FONT_SIZES.xs,
              fontWeight: 600,
              marginBottom: 4,
              color: theme.textMuted,
            }}
          >
            💰 Total
          </div>
          <div
            style={{
              fontSize: FONT_SIZES.base,
              fontWeight: 800,
              color: COLORS.red,
            }}
          >
            GHS {Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
          </div>
        </div>

        <Button
          label="Accept Delivery"
          onClick={() => onAccept((order._id || order.id) as string)}
          loading={accepting}
          size="lg"
          style={{ marginTop: SPACING["2xl"] }}
        />
        <Button
          variant="ghost"
          label="Cancel"
          onClick={onClose}
          size="sm"
          style={{ marginTop: SPACING.sm }}
        />
      </div>
    </div>
  );
}

export default function RiderQueue() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [accepting, setAccepting] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await getAvailableDeliveries();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 20_000);
    const onVisible = () =>
      document.visibilityState === "visible" && fetchDeliveries();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchDeliveries]);

  const handleAccept = async (orderId: string) => {
    setAccepting(true);
    try {
      await acceptDelivery(orderId);
      setSelected(null);
      window.alert(
        "Order Accepted! Head to Stella's Kitchen to pick up the order.",
      );
      fetchDeliveries();
    } catch (e: any) {
      window.alert(e.message || "Could not accept. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

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
          padding: `${SPACING.xl}px ${SPACING["2xl"]}px ${SPACING.md}px`,
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
            Available Deliveries
          </h1>
          <p
            style={{
              fontSize: FONT_SIZES.sm,
              marginTop: 2,
              color: theme.textMuted,
              margin: "2px 0 0",
            }}
          >
            {orders.length} order{orders.length !== 1 ? "s" : ""} near Shai
            Hills
          </p>
        </div>
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          alignSelf: "flex-start",
          margin: `0 ${SPACING["2xl"]}px ${SPACING.lg}px`,
          backgroundColor: "#1E3A5F",
          padding: `${SPACING.xs}px ${SPACING.md}px`,
          borderRadius: RADIUS.full,
          gap: SPACING.sm,
          width: "fit-content",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.delivered,
          }}
        />
        <span
          style={{ color: "#93C5FD", fontSize: FONT_SIZES.xs, fontWeight: 700 }}
        >
          {user?.name?.split(" ")[0]}
          {user?.vehicleType ? `  ·  ${user.vehicleType}` : ""}
        </span>
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
        ) : orders.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: `${SPACING["4xl"]}px 0`,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: SPACING.lg }}>📭</div>
            <div
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              No deliveries right now
            </div>
            <div
              style={{
                fontSize: FONT_SIZES.sm,
                marginTop: SPACING.xs,
                color: theme.textFaint,
              }}
            >
              Pull to refresh or check back shortly
            </div>
          </div>
        ) : (
          orders.map((item) => (
            <OrderCard
              key={String(item._id || item.id)}
              order={item as any}
              variant={isDark ? "dark" : "light"}
              onClick={() => setSelected(item)}
            />
          ))
        )}
      </div>

      <DeliveryDetailModal
        order={selected}
        onClose={() => setSelected(null)}
        onAccept={handleAccept}
        accepting={accepting}
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

function detailCardStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
  };
}
