import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/theme";

export default function AuthLayout() {
  const { isSignedIn, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isSignedIn) return;

    const role = user?.role?.toLowerCase();
    if (role === ROLES.STAFF.toLowerCase()) {
      navigate("/staff/dashboard", { replace: true });
    } else if (role === ROLES.RIDER.toLowerCase()) {
      navigate("/rider/queue", { replace: true });
    }
  }, [isSignedIn, isLoading, user?.role, navigate]);

  // Stack's slide_from_right / fade animation → handled later via a route-transition
  // wrapper (e.g. framer-motion) once components are ported; plain Outlet for now.
  return <Outlet />;
}