import client from "./client";

export type Role = "staff" | "rider";

export interface RegisterPayload {
  role: Role;
  name: string;
  phoneNumber: string;
  password: string;
  locationToken?: string;   // staff only
  vehicleType?: string;     // rider only
  vehiclePlate?: string;    // rider only (optional)
}

export interface AuthResponse {
  user: Record<string, any>;
  token: string;
}

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * Register a new staff or rider account.
 * Automatically handles routing to /staff/register or /rider/register.
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const userType = payload.role?.toLowerCase() === "rider" ? "rider" : "staff";
  const res = await client.post(`/api/auth/${userType}/register`, payload);
  return res.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * Authenticate with phone number + password for both roles.
 */
export async function login(
  phoneNumber: string,
  password: string,
  role: Role = "staff"
): Promise<AuthResponse> {
  const userType = role?.toLowerCase() === "rider" ? "rider" : "staff";
  const credentials = { phoneNumber, password };
  const res = await client.post(`/api/auth/${userType}/login`, credentials);
  return res.data;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
/**
 * Fetch the authenticated user's profile.
 * Requires a valid JWT to be attached by the interceptor.
 */
export async function getProfile(): Promise<Record<string, any>> {
  const res = await client.get("/api/auth/profile");
  return res.data;
}