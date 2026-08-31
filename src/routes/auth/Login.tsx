import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import { BRAND, COLORS, DARK_THEME, FONT_SIZES, LIGHT_THEME, RADIUS, SPACING } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import type { Role } from "../../api/auth";

export default function LoginScreen() {
  const { signIn, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role>(
    ((roleParam || "staff").toLowerCase().trim() as Role)
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(t);
      clearError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roleParam) setSelectedRole(roleParam.toLowerCase().trim() as Role);
  }, [roleParam]);

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password) return;
    clearError();
    setLoading(true);
    try {
      await signIn(phoneNumber.trim(), password, selectedRole);
    } catch {
      /* stored in AuthContext */
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeView variant={isDark ? "dark" : "light"} edges={["top", "left", "right"]}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingLeft: SPACING["2xl"],
          paddingRight: SPACING["2xl"],
          paddingBottom: SPACING["4xl"],
        }}
      >
        {/* Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: SPACING["2xl"],
            paddingTop: SPACING["5xl"],
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: COLORS.red, display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: SPACING.md, boxShadow: theme.shadowMd,
            }}
          >
            <span style={{ color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: 900, letterSpacing: 2 }}>SK</span>
          </div>
          <span style={{ color: COLORS.red, fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 3, marginBottom: SPACING.md }}>
            {BRAND.name.toUpperCase()}
          </span>
          <h1 style={{ fontSize: FONT_SIZES["2xl"], fontWeight: 900, letterSpacing: -0.5, marginBottom: SPACING.xs, color: theme.text }}>
            Welcome back
          </h1>
          <p style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted, margin: 0 }}>Sign in to your workspace</p>
        </div>

        {/* Role toggle — solid fill on the selected state instead of a
            diluted pastel mix (was reading as "washed out") */}
        <div style={{ display: "flex", gap: SPACING.sm, marginBottom: SPACING.xl }}>
          {[
            { value: "staff", label: "🍳 Staff", accent: COLORS.red },
            { value: "rider", label: "🏍️ Rider", accent: "#3B82F6" },
          ].map((r) => {
            const active = selectedRole === r.value;
            return (
              <button
                key={r.value}
                onClick={() => {
                  setSelectedRole(r.value as Role);
                  clearError();
                }}
                style={{
                  flex: 1,
                  padding: `${SPACING.md}px 0`,
                  borderRadius: RADIUS.xl,
                  border: `1.5px solid ${active ? r.accent : theme.borderStrong}`,
                  backgroundColor: active ? r.accent : theme.card,
                  boxShadow: active ? theme.shadowSm : "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: FONT_SIZES.sm,
                    fontWeight: 700,
                    color: active ? COLORS.white : theme.textMuted,
                  }}
                >
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: SPACING.lg }}>
          <label style={fieldLabelStyle(theme)}>Phone Number</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="023#######"
            type="tel"
            autoCapitalize="none"
            autoCorrect="off"
            style={inputStyle(theme, focused === "phone")}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()}
          />

          <label style={fieldLabelStyle(theme)}>Password</label>
          <input
            ref={passwordRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            type="password"
            autoCapitalize="none"
            style={inputStyle(theme, focused === "password")}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {!!error && (
          <div style={{ backgroundColor: "#3F1212", borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, border: "1px solid #7F1D1D" }}>
            <span style={{ color: "#FCA5A5", fontSize: FONT_SIZES.sm, lineHeight: "20px" }}>{error}</span>
          </div>
        )}

        <Button
          label="Sign In"
          onClick={handleLogin}
          loading={loading}
          disabled={loading || !phoneNumber || !password}
          size="lg"
          style={{ marginBottom: SPACING.xl }}
        />

        <div style={{ textAlign: "center", padding: `${SPACING.sm}px 0` }}>
          <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>
            New here?{"  "}
            <Link to="/auth/user-type" style={{ color: COLORS.red, fontWeight: 700, textDecoration: "none" }}>
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </SafeView>
  );
}

function fieldLabelStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    display: "block",
    fontSize: FONT_SIZES.xs,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
    color: theme.textMuted,
  };
}

function inputStyle(theme: typeof DARK_THEME, isFocused: boolean): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: RADIUS.lg,
    border: `1.5px solid ${isFocused ? COLORS.red : theme.borderStrong}`,
    padding: `${SPACING.md}px ${SPACING.lg}px`,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.lg,
    backgroundColor: theme.inputBg,
    color: theme.text,
    boxSizing: "border-box",
  };
}