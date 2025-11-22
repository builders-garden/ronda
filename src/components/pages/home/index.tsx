"use client";

import { AnimatePresence } from "motion/react";
import { Website } from "@/components/pages/website";
import { useAuth } from "@/contexts/auth-context";
import { useEnvironment } from "@/contexts/environment-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import ErrorPage from "../error";
import LoadingPage from "../loading";

export function HomePage() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
  } = useAuth();
  const { isInBrowser } = useEnvironment();
  const { context } = useFarcaster();

  // check if the user is in mobile app (mini app)
  const isInFarcasterMobile =
    !isInBrowser && context?.client?.platformType === "mobile";

  // if the user is in browser, redirect to the website
  if (isInBrowser) {
    return <Website />;
  }

  // if the user is not authenticated, redirect to the login page
  if (isAuthenticated && !user) {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {isAuthLoading ? (
          <LoadingPage key="loading" />
        ) : authError ? (
          <div>Hello</div>
        ) : (
          <ErrorPage key="error" />
        )}
      </AnimatePresence>
    </div>
  );
}
