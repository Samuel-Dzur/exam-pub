"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import {
  getUserRegistrationStatus,
  submitUserRegistration,
} from "@/lib/user-registration";
import {
  getKeycloakSubject,
  getKeycloakUsername,
  hasKeycloakRealmRole,
  initializeKeycloak,
  loginWithKeycloak,
  logoutFromKeycloak,
  registerWithKeycloak,
} from "@/lib/keycloak";
import styles from "./auth-provider.module.css";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
  completeRegistration: (birthDate: string) => Promise<void>;
  error: string | null;
  login: (returnTo: string | null) => Promise<void>;
  logout: () => Promise<void>;
  register: (returnTo: string | null) => Promise<void>;
  status: AuthStatus;
  isBartender: boolean;
  keycloakSubject: string | null;
  username: string | null;
}

const loginPath = "/login";
const registrationPath = "/register";
const AuthContext = createContext<AuthContextValue | null>(null);

function safeReturnPath(returnTo: string | null): string {
  if (
    !returnTo ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.startsWith(loginPath) ||
    returnTo.includes("\\")
  ) {
    return "/bar";
  }

  return returnTo;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isBartender, setIsBartender] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState<boolean | null>(null);
  const [keycloakSubject, setKeycloakSubject] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAuthentication() {
      try {
        const authenticated = await initializeKeycloak();
        if (!mounted) {
          return;
        }

        if (!authenticated) {
          setStatus("unauthenticated");
          return;
        }

        setUsername(getKeycloakUsername());
        setKeycloakSubject(getKeycloakSubject());
        const bartender = hasKeycloakRealmRole("ROLE_BARTENDER");
        setIsBartender(bartender);
        const registration = bartender
          ? { completed: true }
          : await getUserRegistrationStatus();
        if (mounted) {
          setRegistrationComplete(registration.completed);
          setStatus("authenticated");
        }
      } catch {
        if (mounted) {
          setError(
            "Při ověřování přihlášení došlo k chybě. Zkuste to prosím znovu.",
          );
          setStatus("error");
        }
      }
    }

    void initializeAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== loginPath) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`${loginPath}?returnTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (status === "authenticated") {
      if (!registrationComplete && pathname !== registrationPath) {
        router.replace(registrationPath);
        return;
      }
      if (registrationComplete && pathname === registrationPath) {
        router.replace("/bar");
        return;
      }
      if (registrationComplete && pathname === loginPath) {
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        router.replace(safeReturnPath(returnTo));
      }
    }
  }, [pathname, registrationComplete, router, status]);

  const login = useCallback(async (returnTo: string | null) => {
    const redirectPath = safeReturnPath(returnTo);
    await loginWithKeycloak(`${window.location.origin}${redirectPath}`);
  }, []);

  const register = useCallback(async (returnTo: string | null) => {
    const redirectPath = safeReturnPath(returnTo);
    await registerWithKeycloak(`${window.location.origin}${redirectPath}`);
  }, []);

  const logout = useCallback(async () => {
    await logoutFromKeycloak(`${window.location.origin}${loginPath}`);
  }, []);

  const completeRegistration = useCallback(async (birthDate: string) => {
    await submitUserRegistration(birthDate);
    setRegistrationComplete(true);
  }, []);

  const value = useMemo(
    () => ({
      completeRegistration,
      error,
      login,
      logout,
      register,
      status,
      isBartender,
      keycloakSubject,
      username,
    }),
    [
      completeRegistration,
      error,
      isBartender,
      keycloakSubject,
      login,
      logout,
      register,
      status,
      username,
    ],
  );

  if (
    pathname !== loginPath &&
    (status !== "authenticated" ||
      registrationComplete === null ||
      (!registrationComplete && pathname !== registrationPath))
  ) {
    return (
      <main className={styles.status} role={status === "error" ? "alert" : "status"}>
        {status === "error" ? (
          <div className={styles.statusCard}>
            <strong>Nepodařilo se ověřit přihlášení</strong>
            {error}
          </div>
        ) : (
          <div className={styles.loadingStatus}>
            <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
            <strong>Ověřujeme přihlášení</strong>
          </div>
        )}
      </main>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
