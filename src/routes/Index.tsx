import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, DARK_THEME } from "../constants/theme";

export default function Index() {
  const { isLoading, isSignedIn, user } = useAuth();
  const [hasRegistered, setHasRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setHasRegistered(!!localStorage.getItem("has_registered"));
    } catch {
      setHasRegistered(false);
    }
  }, []);

  if (isLoading || hasRegistered === null) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: DARK_THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="animate-spin h-8 w-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#EF4444", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={hasRegistered ? "/auth/login" : "/auth/user-type"} replace />;
  }

  if (user?.role?.toLowerCase() === ROLES.STAFF?.toLowerCase()) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (user?.role?.toLowerCase() === ROLES.RIDER?.toLowerCase()) {
    return <Navigate to="/rider/queue" replace />;
  }

  return <Navigate to="/auth/login" replace />;
}