"use client";

// components
import { CircleUserRoundIcon, Loader2Icon, LogInIcon } from "lucide-react";
import { motion } from "motion/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/auth-context";
import { useFarcaster } from "@/contexts/farcaster-context";
import { PageContent } from "@/lib/enum";
import { cn, formatAvatarSrc, getInitials } from "@/utils";

type UserProfileProps = {
  onClick: () => void;
  pageContent: PageContent;
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
          "size-6 cursor-pointer rounded-xl bg-transparent p-0 transition-all hover:bg-transparent",
          pageContent === PageContent.PROFILE &&
            "rounded-full ring-2 ring-primary"
        )}
        disabled={isDisabled}
        onClick={onClick}
        size="icon"
        variant="ghost"
      >
        {isAuthenticated ? (
          pfpUrl ? (
            <UserAvatar avatarUrl={pfpUrl} className="size-6" size="sm" />
          ) : (
            <div className="size-6 rounded-full text-muted-foreground text-sm">
              {user?.name ? getInitials(user.name) : ""}
            </div>
          )
        ) : isSigningIn ? (
          <div className="flex size-6 items-center justify-center rounded-full">
            <Loader2Icon className="size-6 animate-spin" />
          </div>
        ) : isConnected ? (
          <CircleUserRoundIcon className="size-6" />
        ) : (
          <LogInIcon className="size-6" />
        )}
      </Button>
    </motion.div>
  );
};
