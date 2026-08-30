import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { COLORS, DARK_THEME, FONT_SIZES, LIGHT_THEME, RADIUS, SPACING } from "../../constants/theme";

function Row({
  label,
  value,
  onClick,
  danger,
  theme,
  rightEl,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  theme: typeof DARK_THEME;
  rightEl?: React.ReactNode;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        padding: `${SPACING.lg}px ${SPACING.lg}px`,
        background: "none",
        border: "none",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: theme.border,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: FONT_SIZES.base, flex: 1, color: danger ? COLORS.red : theme.text }}>
        {label}
      </span>
      {rightEl ?? (
        <>
          {value && <span style={{ fontSize: FONT_SIZES.sm, color: theme.textMuted }}>{value}</span>}
          {onClick && !rightEl && (
            <span style={{ fontSize: FONT_SIZES.lg, marginLeft: SPACING.sm, color: theme.textMuted }}>›</span>
          )}
        </>
      )}
    </Tag>
  );
}

function EditModal({
  visible,
  title,
  fieldLabel,
  secure,
  onClose,
  onSave,
  theme,
}: {
  visible: boolean;
  title: string;
  fieldLabel: string;
  secure: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  theme: typeof DARK_THEME;
}) {
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!visible) return null;

  const handleSave = () => {
    if (!value.trim()) {
      window.alert(`${fieldLabel} cannot be empty.`);
      return;
    }
    if (secure && value !== confirm) {
      window.alert("Passwords do not match.");
      return;
    }
    onSave(value);
    setValue("");
    setConfirm("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: theme.cardElevated,
          border: `1px solid ${theme.borderStrong}`,
          boxShadow: theme.shadowMd,
          borderTopLeftRadius: RADIUS["3xl"],
          borderTopRightRadius: RADIUS["3xl"],
          padding: SPACING["2xl"],
          paddingBottom: SPACING["4xl"],
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.borderStrong, margin: "0 auto", marginBottom: SPACING.xl }} />
        <h2 style={{ fontSize: FONT_SIZES.xl, fontWeight: 800, marginBottom: SPACING.xl, color: theme.text }}>{title}</h2>

        <label style={{ fontSize: FONT_SIZES.sm, fontWeight: 600, marginBottom: SPACING.xs, display: "block", color: theme.textMuted }}>
          {fieldLabel}
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={secure ? "password" : "text"}
          autoCapitalize="none"
          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          style={{
            width: "100%",
            border: `1.5px solid ${theme.borderStrong}`,
            borderRadius: RADIUS.lg,
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            fontSize: FONT_SIZES.base,
            backgroundColor: theme.inputBg,
            color: theme.text,
            boxSizing: "border-box",
          }}
        />

        {secure && (
          <>
            <label style={{ fontSize: FONT_SIZES.sm, fontWeight: 600, margin: `${SPACING.md}px 0 ${SPACING.xs}px`, display: "block", color: theme.textMuted }}>
              Confirm Password
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              autoCapitalize="none"
              placeholder="Confirm password"
              style={{
                width: "100%",
                border: `1.5px solid ${theme.borderStrong}`,
                borderRadius: RADIUS.lg,
                padding: `${SPACING.md}px ${SPACING.lg}px`,
                fontSize: FONT_SIZES.base,
                backgroundColor: theme.inputBg,
                color: theme.text,
                boxSizing: "border-box",
              }}
            />
          </>
        )}

        <button
          onClick={handleSave}
          style={{
            width: "100%",
            borderRadius: RADIUS.lg,
            padding: `${SPACING.lg}px`,
            marginTop: SPACING.xl,
            backgroundColor: COLORS.red,
            color: COLORS.white,
            fontWeight: 700,
            fontSize: FONT_SIZES.base,
            border: "none",
            boxShadow: theme.shadowSm,
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            textAlign: "center",
            padding: SPACING.md,
            marginTop: SPACING.sm,
            background: "none",
            border: "none",
            fontSize: FONT_SIZES.sm,
            color: theme.textMuted,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function SettingsScreen({ roleLabel, roleEmoji }: { roleLabel: string; roleEmoji: string }) {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const [modal, setModal] = useState<"phone" | "password" | null>(null);

  const confirmSignOut = () => {
    if (window.confirm("Sign Out — you will need to log in again.")) {
      signOut();
    }
  };

  const handleSavePhone = () => window.alert("Phone number update will be available soon.");
  const handleSavePassword = () => window.alert("Password update will be available soon.");

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: "100%" }}>
      <div style={{ padding: `0 ${SPACING["2xl"]}px`, paddingBottom: 100 }}>
        <h1 style={{ fontSize: FONT_SIZES["2xl"], fontWeight: 800, paddingTop: SPACING.xl, marginBottom: SPACING["2xl"], color: theme.text }}>
          Settings
        </h1>

        <SectionHeader theme={theme}>Profile</SectionHeader>
        <div style={sectionStyle(theme)}>
          <div style={{ display: "flex", alignItems: "center", padding: SPACING["2xl"], gap: SPACING.lg }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: COLORS.red, display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: theme.shadowSm,
              }}
            >
              <span style={{ color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: 800 }}>
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: FONT_SIZES.md, fontWeight: 700, color: theme.text }}>{user?.name ?? "User"}</div>
              <div style={{ fontSize: FONT_SIZES.sm, marginTop: 2, color: theme.textMuted }}>{user?.phoneNumber ?? "—"}</div>
              <div
                style={{
                  marginTop: SPACING.xs, display: "inline-block",
                  padding: `2px ${SPACING.sm}px`, borderRadius: RADIUS.full,
                  backgroundColor: isDark ? "#3F1212" : COLORS.redLight,
                }}
              >
                <span style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, color: COLORS.red }}>
                  {roleEmoji} {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SectionHeader theme={theme}>Account</SectionHeader>
        <div style={sectionStyle(theme)}>
          <Row theme={theme} label="Name" value={user?.name} />
          <Row theme={theme} label="Phone Number" value={user?.phoneNumber} onClick={() => setModal("phone")} />
          <Row theme={theme} label="Role" value={roleLabel} />
          <Row theme={theme} label="Change Password" onClick={() => setModal("password")} />
        </div>

        <SectionHeader theme={theme}>Appearance</SectionHeader>
        <div style={sectionStyle(theme)}>
          <Row
            theme={theme}
            label="Dark Mode"
            rightEl={
              <button
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                style={{
                  width: 44, height: 26, borderRadius: 13, border: "none",
                  backgroundColor: isDark ? COLORS.red : theme.border,
                  position: "relative", cursor: "pointer", transition: "background-color 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute", top: 3, left: isDark ? 21 : 3,
                    width: 20, height: 20, borderRadius: "50%",
                    backgroundColor: COLORS.white, transition: "left 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            }
          />
        </div>

        <SectionHeader theme={theme}>App</SectionHeader>
        <div style={sectionStyle(theme)}>
          <Row theme={theme} label="Version" value="1.0.0" />
          <Row theme={theme} label="Backend" value="Stella's Kitchen API" />
        </div>

        <div style={{ ...sectionStyle(theme), marginTop: SPACING["2xl"] }}>
          <Row theme={theme} label="Sign Out" onClick={confirmSignOut} danger />
        </div>
      </div>

      <EditModal visible={modal === "phone"} title="Change Phone Number" fieldLabel="New Phone Number" secure={false} theme={theme} onClose={() => setModal(null)} onSave={handleSavePhone} />
      <EditModal visible={modal === "password"} title="Change Password" fieldLabel="New Password" secure={true} theme={theme} onClose={() => setModal(null)} onSave={handleSavePassword} />
    </div>
  );
}

function SectionHeader({ children, theme }: { children: React.ReactNode; theme: typeof DARK_THEME }) {
  return (
    <div style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: SPACING.sm, marginTop: SPACING.xl, color: theme.textFaint }}>
      {children}
    </div>
  );
}

function sectionStyle(theme: typeof DARK_THEME): React.CSSProperties {
  return {
    borderRadius: RADIUS["2xl"],
    border: `1px solid ${theme.borderStrong}`,
    boxShadow: theme.shadowSm,
    overflow: "hidden",
    backgroundColor: theme.card,
  };
}