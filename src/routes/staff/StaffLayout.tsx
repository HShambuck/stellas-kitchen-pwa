import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { COLORS, DARK_THEME, LIGHT_THEME } from "../../constants/theme";

function TabIcon({ emoji, label, isActive, theme }: {
  emoji: string; label: string; isActive: boolean; theme: typeof DARK_THEME;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5 min-w-[72px]">
      <div
        className="w-14 h-6.5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: isActive ? theme.pillActive : "transparent" }}
      >
        <span style={{ fontSize: 17 }}>{emoji}</span>
      </div>
      <span
        className="text-[10px] font-semibold tracking-wide"
        style={{ color: isActive ? COLORS.red : theme.textMuted }}
      >
        {label}
      </span>
    </div>
  );
}

const TABS = [
  { to: "dashboard", emoji: "📋", label: "Orders" },
  { to: "new-order", emoji: "➕", label: "New Order" },
  { to: "settings", emoji: "⚙️", label: "Profile" },
];

export default function StaffLayout() {
  const { isSignedIn } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) navigate("/auth/login", { replace: true });
  }, [isSignedIn, navigate]);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: theme.bg }}>
      <div className="flex-1 pb-[84px]">
        <Outlet />
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around pt-2"
        style={{
          backgroundColor: theme.tabBar,
          borderTop: `1px solid ${theme.tabBorder}`,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)",
          boxShadow: "0 -3px 6px rgba(0,0,0,0.08)",
        }}
      >
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="flex-1 flex justify-center">
            {({ isActive }) => (
              <TabIcon emoji={tab.emoji} label={tab.label} isActive={isActive} theme={theme} />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}