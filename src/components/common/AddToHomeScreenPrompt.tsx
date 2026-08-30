import { useEffect, useState } from "react";
import { COLORS, DARK_THEME, LIGHT_THEME } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

const DISMISSED_KEY = "a2hs_dismissed";

function isIos() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isInStandaloneMode() {
  // True once the app is already installed/launched from the home screen
  return (
    "standalone" in window.navigator &&
    (window.navigator as any).standalone === true
  );
}

/**
 * iOS Safari has no `beforeinstallprompt` event — there is no way to
 * programmatically trigger the install flow. This banner detects
 * "iOS Safari, not yet installed, not previously dismissed" and shows
 * manual instructions instead. Android/desktop Chrome get their own
 * native install prompt automatically and don't need this.
 */
export default function AddToHomeScreenPrompt() {
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed && isIos() && !isInStandaloneMode()) {
        // Small delay so it doesn't compete with the initial page render
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom) + 12px)",
        zIndex: 60,
        borderRadius: 20,
        backgroundColor: theme.card,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: COLORS.red,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontWeight: 900,
          color: COLORS.white,
          fontSize: 14,
        }}
      >
        SK
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
          Install Stella's Kitchen
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}>
          Tap <strong>Share</strong> <span aria-hidden>􀈂</span> then{" "}
          <strong>Add to Home Screen</strong>
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          color: theme.textMuted,
          fontSize: 18,
          lineHeight: 1,
          padding: 4,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
