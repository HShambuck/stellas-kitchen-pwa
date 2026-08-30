import { Routes, Route } from "react-router-dom";

import Index from "./routes/Index";

import AuthLayout from "./routes/auth/AuthLayout";
import Login from "./routes/auth/Login";
import Register from "./routes/auth/Register";
import UserType from "./routes/auth/UserType";

import StaffLayout from "./routes/staff/StaffLayout";
import Dashboard from "./routes/staff/Dashboard";
import NewOrder from "./routes/staff/NewOrder";
import StaffSettings from "./routes/staff/Settings";

import RiderLayout from "./routes/rider/RiderLayout";
import Queue from "./routes/rider/Queue";
import Active from "./routes/rider/Active";
import RiderSettings from "./routes/rider/Settings";
import AddToHomeScreenPrompt from "./components/common/AddToHomeScreenPrompt";

export default function App() {
  return (
    <>
      <AddToHomeScreenPrompt />
      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="user-type" element={<UserType />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-order" element={<NewOrder />} />
          <Route path="settings" element={<StaffSettings />} />
        </Route>

        <Route path="/rider" element={<RiderLayout />}>
          <Route path="queue" element={<Queue />} />
          <Route path="active" element={<Active />} />
          <Route path="settings" element={<RiderSettings />} />
        </Route>
      </Routes>
    </>
  );
}
