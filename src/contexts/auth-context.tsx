import {
  sdk as miniappSdk,
  SignIn as SignInCore,
} from "@farcaster/miniapp-sdk";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useEnvironment } from "@/contexts/environment-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import type { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";

export type AuthMethod = "farcaster" | "wallet" | null;

export type AuthContextType = {
  // User data
  user: User | undefined;
  isLoading: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;

  // Environment info
  authMethod: AuthMethod;

  // Loading states
  isLoggingIn: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Environment context (single source of truth for isMiniApp)
  const { isInFarcasterMiniApp, isLoading: isEnvironmentLoading } =
    useEnvironment();

  // Miniapp context
  const { context: miniAppContext, isMiniAppReady } = useFarcaster();

  const {
    data: session,
    isPending: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = authClient.useSession();

  const user = useMemo(() => {
    if (!session) {
      return null;
    }
    return {
      id: session?.user?.id ?? "",
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      emailVerified: session?.user?.emailVerified ?? false,
      createdAt: session?.user?.createdAt ?? new Date(),
      updatedAt: session?.user?.updatedAt ?? new Date(),
      image: session?.user?.image ?? null,
    };
  }, [session]);

  // Local state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authError, setError] = useState<Error | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [hasTriedInitialAuth, setHasTriedInitialAuth] = useState(false);
  const [hasAttemptedFarcasterAutoSignIn, setHasAttemptedFarcasterAutoSignIn] =
    useState(false);

  const signInWithFarcaster = useCallback(async () => {
    if (!miniAppContext) {
      throw new Error("Not in mini app");
    }

    try {
      setIsSigningIn(true);
      setError(null);
      console.log("Starting Farcaster sign-in");

      // 1. Get token from SIWF Quick Auth
      const result = await miniappSdk.quickAuth.getToken();
      if (!result) {
        throw new Error("No token from SIWF Quick Auth");
      }
      console.log("QuickAuth token acquired");

      // 2. Verify token with better-auth-siwf plugin (@farcaster/quick-auth under the hood)
      const response = await authClient.signInWithFarcaster({
        token: result.token,
        user: {
          fid: miniAppContext.user.fid,
          username: miniAppContext.user.username,
          displayName: miniAppContext.user.displayName,
          pfpUrl: miniAppContext.user.pfpUrl,
          notificationDetails: miniAppContext.client.notificationDetails
            ? [
                {
                  ...miniAppContext.client.notificationDetails,
                  appFid: miniAppContext.client.clientFid,
                },
              ]
            : [],
        },
      });
      if (
        !(response.data && "success" in response.data && response.data.success)
      ) {
        throw new Error("No response from SIWF verify");
      }
      setAuthMethod("farcaster");
      setIsSignedIn(true);
      setIsSigningIn(false);
      refetchSession();
      console.log("Session refetch triggered");
    } catch (err) {
      if (err instanceof SignInCore.RejectedByUser) {
        setError(new Error("Rejected by user"));
        console.log("Farcaster sign-in rejected by user");
        return;
      }
      console.error("[Auth] Farcaster sign-in error:", err);
      setError(
        err instanceof Error ? err : new Error("Farcaster sign-in failed")
      );
      setIsSigningIn(false);
      console.log("Farcaster sign-in failed");
    }
  }, [miniAppContext, refetchSession]);

  // Auto sign-in logic (production / normal flow) -----------------------------------------------
  useEffect(() => {
    // If we're in a miniapp, wait for it to be ready
    if (isInFarcasterMiniApp && !isMiniAppReady) {
      return;
    }

    // If we have a user from the initial fetch, mark signed in
    if (user) {
      setIsSignedIn(true);
      // If we're in miniapp, prefer farcaster as method
      if (isInFarcasterMiniApp) {
        setAuthMethod("farcaster");
      }
      setHasTriedInitialAuth(true);
      return;
    }

    // If the session request completed (with or without error) and there's no user,
    // mark that we've tried initial auth so auto sign-in can proceed
    if (isSessionLoading || hasTriedInitialAuth) {
      // skip until session resolves and we haven't tried
    } else {
      setHasTriedInitialAuth(true);
    }

    // Only proceed with sign-in flows after we've tried the initial auth check
    if (!hasTriedInitialAuth || isSigningIn) {
      return;
    }

    // Auto sign-in with Farcaster if in miniapp and not authenticated
    if (
      isInFarcasterMiniApp &&
      miniAppContext &&
      !authMethod &&
      !hasAttemptedFarcasterAutoSignIn
    ) {
      console.log("Triggering auto Farcaster sign-in");
      setHasAttemptedFarcasterAutoSignIn(true);
      signInWithFarcaster();
    }
  }, [
    authMethod,
    hasTriedInitialAuth,
    isInFarcasterMiniApp,
    isMiniAppReady,
    miniAppContext,
    isSigningIn,
    signInWithFarcaster,
    isSessionLoading,
    hasAttemptedFarcasterAutoSignIn,
    user,
  ]);

  // Auto sign-in with wallet when wallet is connected
  useEffect(() => {
    // Wait for environment detection to complete (with timeout fallback)
    if (isEnvironmentLoading) {
      return;
    }

    // If we're in a miniapp, wait for it to be ready
    if (isInFarcasterMiniApp && !isMiniAppReady) {
      return;
    }

    // Only proceed with wallet sign-in after we've tried initial auth check
    if (!hasTriedInitialAuth || isSigningIn) {
      return;
    }
  }, [
    hasTriedInitialAuth,
    isInFarcasterMiniApp,
    isMiniAppReady,
    isEnvironmentLoading,
    isSigningIn,
  ]);
  // NOTE: logoutMutation intentionally excluded to prevent infinite loops

  const value: AuthContextType = {
    user: user ?? undefined,
    isLoading:
      isEnvironmentLoading ||
      (isInFarcasterMiniApp && !isMiniAppReady) ||
      isSigningIn ||
      isSessionLoading,
    error: authError || (sessionError as Error | null),
    setError,
    authMethod,
    isLoggingIn: isSigningIn,
    isAuthenticated: isSignedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
