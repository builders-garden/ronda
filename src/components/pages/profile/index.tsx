"use client";

import { Settings } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { formatAvatarSrc } from "@/utils";
import { ProfileHeader } from "./components/profile-header";
import { ProfileStats } from "./components/profile-stats";
import { SupportSection } from "./components/support-section";

export default function ProfilePage() {
  const { user } = useAuth();
  const { context, isInMiniApp } = useFarcaster();

  const pfpUrl =
    isInMiniApp && context?.user.pfpUrl
      ? formatAvatarSrc(context.user.pfpUrl)
      : user?.image
        ? formatAvatarSrc(user.image)
        : null;

  const displayName =
    isInMiniApp && context?.user.displayName
      ? context.user.displayName
      : user?.name || "User";

  const username =
    isInMiniApp && context?.user.username ? context.user.username : null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative flex w-full flex-col items-center justify-start gap-8 px-6 py-6 pb-24"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Header with Title and Settings */}
      <div className="flex w-full items-center justify-between">
        <h1 className="font-bold text-muted text-xl">Profile</h1>
        <motion.button
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg"
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="size-6 text-muted" />
        </motion.button>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        avatarUrl={pfpUrl}
        displayName={displayName}
        username={username}
      />

      {/* Stats Grid */}
      <ProfileStats />

      {/* Support Section */}
      <SupportSection />
    </motion.div>
  );
}
