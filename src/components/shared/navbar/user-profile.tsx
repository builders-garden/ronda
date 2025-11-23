"use client";

// components
import { CircleUserRoundIcon, Loader2Icon, LogInIcon } from "lucide-react";
import { motion } from "motion/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { MainPageContent } from "@/lib/enum";
import { cn, formatAvatarSrc, getInitials } from "@/utils";

type UserProfileProps = {
  onClick: () => void;
  pageContent: MainPageContent;
};

export const UserProfile = ({ onClick, pageContent }: UserProfileProps) => {
  const { context, isInMiniApp } = useFarcaster();
  const { user, isAuthenticated, isLoading: isSigningIn } = useAuth();
  const { isConnected } = useAccount();

  const isDisabled =
    !isInMiniApp && (isSigningIn || (isConnected && isAuthenticated));

  const pfpUrl =
    isInMiniApp && context?.user.pfpUrl
      ? formatAvatarSrc(context.user.pfpUrl)
      : user?.image
        ? formatAvatarSrc(user.image)
        : null;

  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <Button
        className={cn(
          "size-[26px] cursor-pointer rounded-xl bg-transparent p-0 transition-all hover:bg-transparent",
          pageContent === MainPageContent.PROFILE &&
            "rounded-full ring-2 ring-primary"
        )}
        disabled={isDisabled}
        onClick={onClick}
        size="icon"
        variant="ghost"
      >
        {isAuthenticated ? (
          pfpUrl ? (
            <UserAvatar avatarUrl={pfpUrl} className="size-[26px]" size="sm" />
          ) : (
            <div className="size-[26px] rounded-full text-muted-foreground text-sm">
              {user?.name ? getInitials(user.name) : ""}
            </div>
          )
        ) : isSigningIn ? (
          <div className="flex size-[26px] items-center justify-center rounded-full">
            <Loader2Icon className="size-[26px] animate-spin" />
          </div>
        ) : isConnected ? (
          <CircleUserRoundIcon className="size-[26px]" />
        ) : (
          <LogInIcon className="size-[26px]" />
        )}
      </Button>
    </motion.div>
  );
};
