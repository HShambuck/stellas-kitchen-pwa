import axios from "axios";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ohh2sn3qr6.execute-api.eu-west-2.amazonaws.com";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor — Attach JWT ────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage failure (e.g. private mode) is non-fatal; request proceeds without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Normalise errors ─────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    const normalised = new Error(message) as Error & {
      status?: number;
      data?: unknown;
    };
    normalised.status = error.response?.status;
    normalised.data = error.response?.data;
    return Promise.reject(normalised);
  }
);

export default client;