"use client";

import { AnimatePresence } from "motion/react";
import { Website } from "@/components/pages/website";
import { Navbar } from "@/components/shared/navbar";
import { useAuth } from "@/contexts/auth-context";
import { useEnvironment } from "@/contexts/environment-context";
import { usePageContent } from "@/contexts/page-content-context";
import { PageContent } from "@/lib/enum";
import ErrorPage from "../error";
import HomePage from "../home";
import LoadingPage from "../loading";
import ProfilePage from "../profile";

export function App() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
  } = useAuth();
  const { isInBrowser } = useEnvironment();
  // const { context } = useFarcaster();
  const { pageContent } = usePageContent();

  // check if the user is in mobile app (mini app)
  // const isInFarcasterMobile =
  //   !isInBrowser && context?.client?.platformType === "mobile";

  // if the user is in browser, redirect to the website
  if (isInBrowser) {
    return <Website />;
  }

  // if the user is not authenticated, redirect to the login page
  if (isAuthenticated && !user) {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {isAuthLoading ? (
          <LoadingPage key="loading" />
        ) : authError ? (
          <ErrorPage key="error" />
        ) : pageContent === PageContent.HOME ? (
          <HomePage key="home" />
        ) : pageContent === PageContent.CIRCLES ? (
          <div>Circles</div>
        ) : pageContent === PageContent.PROFILE ? (
          <ProfilePage key="profile" />
        ) : null}
      </AnimatePresence>
      {!(isAuthLoading || authError) && <Navbar />}
    </div>
  );
}
