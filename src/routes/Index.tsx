import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROLES } from "../constants/theme";

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

  // Wait for auth + storage check (no "navigator mount" delay needed on web)
  if (isLoading || hasRegistered === null) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: COLORS.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-t-transparent"
             style={{ borderColor: COLORS.red, borderTopColor: "transparent" }} />
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