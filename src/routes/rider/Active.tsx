import { useCallback, useEffect, useState } from "react";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import StatusBadge from "../../components/orders/StatusBadge";
import { getMyActiveDelivery, updateOrderStatus } from "../../api/orders";
import { COLORS, DARK_THEME, FONT_SIZES, LIGHT_THEME, RADIUS, SPACING } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

const STATUS = { OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered" };

const STEPS = [
  { label: "Out for Delivery", status: STATUS.OUT_FOR_DELIVERY, desc: "On your way to the customer" },
  { label: "Delivered", status: STATUS.DELIVERED, desc: "Order complete!" },
];

interface Job {
  _id?: string; id?: string; statusState: string; customerName?: string;
  phoneNumber?: string; deliveryAddress?: string; totalAmount?: number;
  items?: { _id?: string; id?: string; quantity?: number; foodItemName?: string; name?: string; menuItemName?: string; price?: number }[];
}

function StepIndicator({ currentStatus, theme }: { currentStatus: string; theme: typeof DARK_THEME }) {
  return (
    <div>
      {STEPS.map((step, i) => {
        const isActive = step.status === currentStatus;
        const isDone =
          STEPS.slice(0, i + 1).some((s) => s.status === currentStatus) ||
          (i === 0 && currentStatus === STATUS.OUT_FOR_DELIVERY) ||
          (i === 1 && currentStatus === STATUS.DELIVERED);
        return (
          <div key={step.status} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, marginRight: SPACING.lg }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: isDone ? COLORS.delivered : isActive ? COLORS.red : theme.border,
                }}
              >
                <span style={{ color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: 700 }}>{isDone ? "✓" : i + 1}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, margin: "4px 0", backgroundColor: isDone ? COLORS.delivered : theme.border }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: SPACING.lg }}>
              <div style={{ fontSize: FONT_SIZES.base, fontWeight: 600, color: isActive ? theme.text : theme.textMuted }}>{step.label}</div>
              {isActive && <div style={{ fontSize: FONT_SIZES.sm, marginTop: 2, color: theme.textMuted }}>{step.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ActiveDelivery() {
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [historyJobs, setHistoryJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const raw = await getMyActiveDelivery();
      const jobs: Job[] = Array.isArray(raw) ? raw : [];
      setActiveJob(jobs.find((j) => j.statusState === STATUS.OUT_FOR_DELIVERY) || null);
      setHistoryJobs(jobs.filter((j) => j.statusState === STATUS.DELIVERED));
    } catch {
      setActiveJob(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 20_000);
    const onVisible = () => document.visibilityState === "visible" && fetchJobs();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchJobs]);

  const handleMarkDelivered = async () => {
    if (!activeJob) return;
    setUpdating(true);
    try {
      await updateOrderStatus((activeJob._id || activeJob.id) as string, STATUS.DELIVERED as any);
      await fetchJobs();
    } catch (e: any) {
      window.alert(e.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  };

  const callCustomer = (phone?: string) => {
    if (!phone) { window.alert("This order has no phone number."); return; }
    window.location.href = `tel:${phone}`;
  };

  const openMaps = (address?: string) => {
    if (!address) return;
    const q = encodeURIComponent(`${address}, Shai Hills, Ghana`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  return (
    <SafeView variant={isDark ? "dark" : "light"} edges={["top", "left", "right"]}>
      <div style={{ flex: 1, overflowY: "auto", paddingLeft: SPACING["2xl"], paddingRight: SPACING["2xl"], paddingBottom: SPACING["4xl"] * 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: SPACING.xl, marginBottom: SPACING.xl }}>
          <h1 style={{ fontSize: FONT_SIZES.xl, fontWeight: 800, color: theme.text, margin: 0 }}>Logistics Run</h1>
          <button
            onClick={() => { setRefreshing(true); fetchJobs(); }}
            style={{ fontSize: FONT_SIZES.xs, fontWeight: 600, color: theme.textMuted, background: "none", border: `1px solid ${theme.borderStrong}`, borderRadius: RADIUS.full, padding: `${SPACING.xs}px ${SPACING.md}px`, cursor: "pointer" }}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <CenterSpinner />
        ) : !activeJob && historyJobs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: `${SPACING["4xl"]}px 0` }}>
            <div style={{ fontSize: 52, marginBottom: SPACING.lg }}>🏁</div>
            <div style={{ fontSize: FONT_SIZES.lg, fontWeight: 700, marginBottom: SPACING.xs, color: theme.text }}>No active tasks</div>
            <div style={{ fontSize: FONT_SIZES.sm, textAlign: "center", color: theme.textFaint }}>Accept an order from the Queue tab to begin.</div>
          </div>
        ) : (
          <>
            {activeJob && (
              <div>
                <div style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: SPACING.sm, color: theme.textMuted }}>
                  ⚡ Current Run
                </div>

                <div style={cardStyle(theme)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
                    <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, letterSpacing: 1, color: theme.textMuted }}>
                      #{String(activeJob._id || activeJob.id).slice(-5).toUpperCase()}
                    </span>
                    <StatusBadge status={activeJob.statusState} />
                  </div>

                  <div style={{ fontSize: FONT_SIZES.xl, fontWeight: 800, marginBottom: SPACING.lg, color: theme.text }}>
                    {activeJob.customerName || "Customer"}
                  </div>

                  <div style={rowStyle(theme)}>
                    <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>📞 Phone</span>
                    <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 600, color: theme.text }}>{activeJob.phoneNumber || "—"}</span>
                  </div>

                  <div style={rowStyle(theme)}>
                    <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>📍 Location</span>
                    <button onClick={() => openMaps(activeJob.deliveryAddress)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 600, color: "#60A5FA", textDecoration: "underline" }}>
                        {activeJob.deliveryAddress || "—"} 🗺️
                      </span>
                    </button>
                  </div>

                  <div style={{ ...rowStyle(theme), borderBottom: "none" }}>
                    <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>💰 Total</span>
                    <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 800, color: COLORS.red }}>GHS {Number(activeJob.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <Button
                    variant="secondary"
                    label="📞 Call Customer"
                    onClick={() => callCustomer(activeJob.phoneNumber)}
                    size="sm"
                    style={{ marginTop: SPACING.lg, borderColor: "#16A34A", borderWidth: 2 } as any}
                    labelStyle={{ color: "#16A34A" }}
                  />
                </div>

                <div style={cardStyle(theme)}>
                  <div style={{ fontSize: FONT_SIZES.base, fontWeight: 700, marginBottom: SPACING.xl, color: theme.text }}>Delivery Progress</div>
                  <StepIndicator currentStatus={activeJob.statusState} theme={theme} />
                </div>

                <div style={cardStyle(theme)}>
                  <div style={{ fontSize: FONT_SIZES.base, fontWeight: 700, marginBottom: SPACING.xl, color: theme.text }}>Items</div>
                  {(activeJob.items || []).length === 0 ? (
                    <span style={{ fontSize: FONT_SIZES.sm, color: theme.textFaint }}>No items listed</span>
                  ) : (
                    (activeJob.items || []).map((item, i) => (
                      <div key={item._id || item.id || i} style={{ display: "flex", alignItems: "center", padding: `${SPACING.xs}px 0`, gap: SPACING.sm }}>
                        <span style={{ color: COLORS.red, fontWeight: 700, width: 24 }}>{item.quantity || 1}×</span>
                        <span style={{ flex: 1, fontSize: FONT_SIZES.sm, color: theme.text }}>
                          {item.foodItemName || item.name || item.menuItemName || "Item"}
                        </span>
                        <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>
                          GHS {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <Button label="Mark as Delivered ✓" onClick={handleMarkDelivered} loading={updating} size="lg" style={{ marginTop: SPACING.sm }} />
              </div>
            )}

            {historyJobs.length > 0 && (
              <div style={activeJob ? { marginTop: SPACING.xl } : {}}>
                <div style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: SPACING.sm, color: theme.textMuted }}>
                  🏁 Completed This Shift ({historyJobs.length})
                </div>
                {historyJobs.map((job) => (
                  <div key={job._id || job.id} style={{ borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.sm, border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.card, boxShadow: theme.shadowSm }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
                      <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, letterSpacing: 1, color: theme.textMuted }}>
                        #{String(job._id || job.id).slice(-5).toUpperCase()}
                      </span>
                      <span style={{ color: COLORS.delivered, fontSize: FONT_SIZES.xs, fontWeight: 700 }}>Delivered ✅</span>
                    </div>
                    <div style={{ fontSize: FONT_SIZES.base, fontWeight: 800, color: theme.text }}>{job.customerName || "Customer"}</div>
                    <div style={{ fontSize: FONT_SIZES.sm, marginTop: 2, color: theme.textMuted }}>{job.deliveryAddress || "—"}</div>
                    <div style={{ color: COLORS.delivered, fontSize: FONT_SIZES.sm, fontWeight: 700, marginTop: 4 }}>GHS {Number(job.totalAmount || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SafeView>
  );
}

function CenterSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: `${SPACING["4xl"]}px 0` }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.red}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function cardStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return { borderRadius: RADIUS["2xl"], padding: SPACING["2xl"], marginBottom: SPACING.lg, border: `1px solid ${theme.borderStrong}`, backgroundColor: theme.card, boxShadow: theme.shadowSm };
}

function rowStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return { display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${SPACING.sm}px 0`, borderBottom: `1px solid ${theme.border}` };
}