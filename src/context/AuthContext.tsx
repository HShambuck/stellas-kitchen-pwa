import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { login as apiLogin, register as apiRegister, type Role } from "../api/auth";

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  [key: string]: any;
  name?: string;
  phoneNumber?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "RESTORE_SESSION"; user: User | null; token: string | null }
  | { type: "SIGN_IN"; user: User; token: string }
  | { type: "SIGN_OUT" }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "CLEAR_ERROR" };

const INITIAL_STATE: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isSignedIn: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.user,
        token: action.token,
        isSignedIn: !!action.token,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...state,
        user: action.user,
        token: action.token,
        isSignedIn: true,
        isLoading: false,
        error: null,
      };
    case "SIGN_OUT":
      return { ...INITIAL_STATE, isLoading: false };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  signIn: (phoneNumber: string, password: string, role: Role) => Promise<void>;
  signUp: (payload: any) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  // ── Cold-start: restore persisted session ──────────────────────────────────
  useEffect(() => {
    try {
      const token = localStorage.getItem(KEYS.TOKEN);
      const userJson = localStorage.getItem(KEYS.USER);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        dispatch({ type: "RESTORE_SESSION", user, token });
      } else {
        dispatch({ type: "RESTORE_SESSION", user: null, token: null });
      }
    } catch {
      dispatch({ type: "RESTORE_SESSION", user: null, token: null });
    }
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persistSession = (token: string, user: User) => {
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (payload: any) => {
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "CLEAR_ERROR" });
    try {
      const responseData = await apiRegister(payload);
      const token = responseData.token;
      const { token: _drop, ...user } = responseData as any;

      persistSession(token, user);
      localStorage.setItem("has_registered", "true");
      dispatch({ type: "SIGN_IN", user, token });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", error: err.message });
      throw err;
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (phoneNumber: string, password: string, role: Role) => {
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "CLEAR_ERROR" });
    try {
      const responseData = await apiLogin(phoneNumber, password, role);
      const token = responseData.token;
      const { token: _drop, ...user } = responseData as any;

      persistSession(token, user);
      dispatch({ type: "SIGN_IN", user, token });
    } catch (err: any) {
      dispatch({ type: "SET_ERROR", error: err.message });
      throw err;
    }
  }, []);

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    clearSession();
    dispatch({ type: "SIGN_OUT" });
    // Do NOT navigate here — Index.tsx / layouts redirect when isSignedIn becomes false
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isLoading: state.isLoading,
        isSignedIn: state.isSignedIn,
        error: state.error,
        signIn,
        signUp,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}