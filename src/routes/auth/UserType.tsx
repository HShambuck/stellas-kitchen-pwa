import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SafeView from "../../components/common/SafeView";
import { useTheme } from "../../context/ThemeContext";
import { BRAND, COLORS, DARK_THEME, FONT_SIZES, LIGHT_THEME, RADIUS, ROLES, SPACING } from "../../constants/theme";

const ROLE_CARDS = [
  { role: ROLES.STAFF, icon: "🍳", title: "Kitchen Staff", tagline: "Manage & update orders", accent: COLORS.red, accentBg: "#3F1212", accentLight: "#FEE2E2" },
  { role: ROLES.RIDER, icon: "🏍️", title: "Delivery Rider", tagline: "Pick up & deliver orders", accent: "#3B82F6", accentBg: "#1E3A5F", accentLight: "#DBEAFE" },
];

export default function UserTypeScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <SafeView variant={isDark ? "dark" : "light"}>
      <div style={{ flex: 1, overflowY: "auto", paddingLeft: SPACING["2xl"], paddingRight: SPACING["2xl"], paddingBottom: SPACING["4xl"] }}>
        {/* Hero */}
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: SPACING["4xl"], marginBottom: SPACING["3xl"],
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div style={{ position: "relative", marginBottom: SPACING.xl }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: COLORS.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: theme.shadowMd }}>
              <span style={{ color: COLORS.white, fontSize: FONT_SIZES["2xl"], fontWeight: 900, letterSpacing: 2 }}>SK</span>
            </div>
            {/* was COLORS.dark — fixed to always match the dark splash bg it's meant to punch through */}
            <div style={{ position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.delivered, border: `3px solid ${DARK_THEME.bg}` }} />
          </div>
          <span style={{ color: COLORS.red, fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 3, marginBottom: SPACING.lg }}>{BRAND.name.toUpperCase()}</span>
          <h1 style={{ fontSize: FONT_SIZES["3xl"], fontWeight: 900, letterSpacing: -0.5, marginBottom: SPACING.sm, textAlign: "center", color: theme.text }}>Who are you?</h1>
          <p style={{ fontSize: FONT_SIZES.base, textAlign: "center", color: theme.textMuted, margin: 0 }}>Select your role to get started</p>
        </div>

        {/* Role cards — border bumped to borderStrong + shadow added so cards read as
            distinct surfaces instead of blending into the page (previous issue) */}
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md, marginBottom: SPACING["2xl"], opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>
          {ROLE_CARDS.map((card) => {
            const isActive = selected === card.role;
            return (
              <button
                key={card.role}
                onClick={() => setSelected(card.role)}
                style={{
                  display: "flex", alignItems: "center", textAlign: "left",
                  borderRadius: RADIUS["2xl"], padding: SPACING.xl, gap: SPACING.lg,
                  backgroundColor: isActive ? (isDark ? card.accentBg : card.accentLight) : theme.card,
                  border: `${isActive ? 2 : 1}px solid ${isActive ? card.accent : theme.borderStrong}`,
                  boxShadow: theme.shadowSm,
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: RADIUS.lg, backgroundColor: card.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>{card.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: FONT_SIZES.md, fontWeight: 800, marginBottom: 2, color: isActive ? card.accent : theme.text }}>{card.title}</div>
                  <div style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>{card.tagline}</div>
                </div>
                <div
                  style={{
                    width: 24, height: 24, borderRadius: 12, border: `2px solid ${isActive ? card.accent : theme.borderStrong}`,
                    backgroundColor: isActive ? card.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  {isActive && <span style={{ color: COLORS.white, fontSize: 12, fontWeight: 800 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            marginBottom: SPACING.lg,
            opacity: selected ? 1 : 0,
            transform: selected ? "scale(1)" : "scale(0.9)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            pointerEvents: selected ? "auto" : "none",
          }}
        >
          <button
            onClick={() => navigate(`/auth/register?role=${selected}`)}
            style={{ width: "100%", backgroundColor: COLORS.red, padding: `${SPACING.lg}px 0`, borderRadius: RADIUS.xl, border: "none", cursor: "pointer", boxShadow: theme.shadowMd }}
          >
            <span style={{ color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: 700, letterSpacing: 0.3 }}>
              Continue as {selected === ROLES.STAFF ? "Staff" : "Rider"} →
            </span>
          </button>
        </div>

        {/* Sign in link */}
        <div
          style={{ textAlign: "center", padding: `${SPACING.md}px 0`, cursor: "pointer" }}
          onClick={() => navigate(selected ? `/auth/login?role=${selected}` : "/auth/login")}
        >
          <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>
            Have an account?{"  "}
            <span style={{ color: COLORS.red, fontWeight: 700 }}>Sign in</span>
          </span>
        </div>
      </div>
    </SafeView>
  );
}