import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { COLORS, DARK_THEME, LIGHT_THEME } from "../../constants/theme";

function TabIcon({ icon, label, isActive, theme }: {
  icon: string; label: string; isActive: boolean; theme: typeof DARK_THEME;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5">
      <div
        className="w-13 h-6.5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: isActive ? theme.pillActive : "transparent" }}
      >
        <span style={{ fontSize: 17, color: isActive ? COLORS.red : theme.textMuted }}>
          {icon}
        </span>
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
  { to: "queue", icon: "▦", label: "Queue" },
  { to: "active", icon: "◎", label: "Active" },
  { to: "settings", icon: "⚙", label: "Profile" },
];

export default function RiderLayout() {
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
          boxShadow: theme.shadowMd,
        }}
      >
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="flex-1 flex justify-center">
            {({ isActive }) => (
              <TabIcon icon={tab.icon} label={tab.label} isActive={isActive} theme={theme} />
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}