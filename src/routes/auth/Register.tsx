import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import {
  COLORS,
  DARK_THEME,
  FONT_SIZES,
  LIGHT_THEME,
  RADIUS,
  ROLES,
  SPACING,
  VEHICLE_TYPES,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  type?: string;
  autoCapitalize?: string;
  onEnter?: () => void;
  theme: typeof DARK_THEME;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure,
  type,
  onEnter,
  theme,
  focused,
  onFocus,
  onBlur,
}: FieldProps) {
  return (
    <div style={{ marginBottom: SPACING.lg }}>
      <label
        style={{
          display: "block",
          fontSize: FONT_SIZES.xs,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: SPACING.xs,
          color: theme.textMuted,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={secure ? "password" : type || "text"}
        autoCapitalize="none"
        style={{
          width: "100%",
          borderRadius: RADIUS.lg,
          border: `1.5px solid ${focused ? COLORS.red : theme.border}`,
          padding: `${SPACING.md}px ${SPACING.lg}px`,
          fontSize: FONT_SIZES.base,
          backgroundColor: theme.inputBg,
          color: theme.text,
          boxSizing: "border-box",
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      />
    </div>
  );
}

export default function RegisterScreen() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const navigate = useNavigate();
  const isStaff = role === ROLES.STAFF || role === "staff";

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    locationToken: "",
    vehicleType: "",
    vehiclePlate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.phoneNumber.trim()) return "Please enter your phone number.";
    const d = form.phoneNumber.replace(/\D/g, "");
    if (d.length < 9 || d.length > 13) return "Enter a valid phone number.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    if (isStaff && !form.locationToken.trim())
      return "Please enter your kitchen location token.";
    if (!isStaff && !form.vehicleType)
      return "Please select your vehicle type.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return setError(err);
    setError("");
    setLoading(true);
    const formattedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "Staff";
    const payload = {
      role: formattedRole as any,
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      ...(isStaff
        ? { locationToken: form.locationToken.trim() }
        : {
            vehicleType: form.vehicleType,
            vehiclePlate: form.vehiclePlate.trim(),
          }),
    };
    try {
      await signUp(payload);
      // has_registered flag is already set inside AuthContext.signUp
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fp = (name: string) => ({
    focused: focused === name,
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
    theme,
  });

  const accent = isStaff ? COLORS.red : "#3B82F6";
  const accentBg = isStaff ? "#FEE2E2" : "#DBEAFE";

  return (
    <SafeView
      variant={isDark ? "dark" : "light"}
      edges={["top", "left", "right"]}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingLeft: SPACING["2xl"],
          paddingRight: SPACING["2xl"],
          paddingBottom: SPACING["4xl"],
        }}
      >
        {/* Header */}
        <div
          style={{ marginBottom: SPACING["2xl"], paddingTop: SPACING["2xl"] }}
        >
          <div
            style={{
              display: "inline-block",
              padding: `${SPACING.xs}px ${SPACING.md}px`,
              borderRadius: RADIUS.full,
              marginBottom: SPACING.lg,
              backgroundColor: accentBg,
            }}
          >
            <span
              style={{
                fontSize: FONT_SIZES.sm,
                fontWeight: 700,
                color: accent,
              }}
            >
              {isStaff ? "🍳  Kitchen Staff" : "🏍️  Delivery Rider"}
            </span>
          </div>
          <h1
            style={{
              fontSize: FONT_SIZES["2xl"],
              fontWeight: 900,
              marginBottom: SPACING.sm,
              letterSpacing: -0.5,
              color: theme.text,
            }}
          >
            Create account
          </h1>
          <p
            style={{
              fontSize: FONT_SIZES.sm,
              lineHeight: "20px",
              color: theme.textMuted,
              margin: 0,
            }}
          >
            {isStaff
              ? "You'll need a location token from your manager"
              : "Tell us about your vehicle for delivery matching"}
          </p>
        </div>

        <Field
          {...fp("name")}
          label="Full Name"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Kwame Mensah"
        />
        <Field
          {...fp("phone")}
          label="Phone Number"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          placeholder="023#######"
          type="tel"
        />
        <Field
          {...fp("pass")}
          label="Password"
          value={form.password}
          onChange={set("password")}
          placeholder="Min. 6 characters"
          secure
        />
        <Field
          {...fp("confirm")}
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Repeat password"
          secure
          onEnter={isStaff ? undefined : handleSubmit}
        />

        {isStaff ? (
          <Field
            {...fp("token")}
            label="Location Token"
            value={form.locationToken}
            onChange={set("locationToken")}
            placeholder="Provided by your manager"
            onEnter={handleSubmit}
          />
        ) : (
          <>
            <label
              style={{
                display: "block",
                fontSize: FONT_SIZES.xs,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: SPACING.xs,
                color: theme.textMuted,
              }}
            >
              Vehicle Type
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: SPACING.sm,
                marginBottom: SPACING.lg,
                marginTop: SPACING.xs,
              }}
            >
              {VEHICLE_TYPES.map((v) => {
                const active = form.vehicleType === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => set("vehicleType")(v.value)}
                    style={{
                      padding: `${SPACING.sm}px ${SPACING.lg}px`,
                      borderRadius: RADIUS.full,
                      border: `1.5px solid ${active ? COLORS.red : theme.border}`,
                      backgroundColor: active ? "#3F1212" : theme.card,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: FONT_SIZES.sm,
                        fontWeight: 600,
                        color: active ? COLORS.red : theme.textMuted,
                      }}
                    >
                      {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <Field
              {...fp("plate")}
              label="Plate / ID (optional)"
              value={form.vehiclePlate}
              onChange={set("vehiclePlate")}
              placeholder="e.g. GR-1234-22"
              onEnter={handleSubmit}
            />
          </>
        )}

        {!!error && (
          <div
            style={{
              backgroundColor: "#3F1212",
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.lg,
              border: "1px solid #7F1D1D",
            }}
          >
            <span
              style={{
                color: "#FCA5A5",
                fontSize: FONT_SIZES.sm,
                lineHeight: "20px",
              }}
            >
              {error}
            </span>
          </div>
        )}

        <Button
          label="Create Account"
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          size="lg"
          style={{ marginBottom: SPACING.xl }}
        />

        <div
          style={{
            textAlign: "center",
            padding: `${SPACING.sm}px 0`,
            cursor: "pointer",
          }}
          onClick={() => navigate("/auth/login")}
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
