import { AlertCircle, CheckCircle2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { RondaDrawer } from "@/components/shared/ronda-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePageContent } from "@/contexts/page-content-context";
import type { CirclesPageContent } from "@/lib/enum";
import { cn } from "@/utils";

type CircleStatus = "active" | "deposit_due" | "completed";

type CircleCardProps = {
  address: string;
  name: string;
  memberCount: number;
  weeklyAmount: string;
  currentWeek: number;
  totalWeeks: number;
  currentPot: string;
  nextPayout?: string;
  lastPayout?: string;
  status: CircleStatus;
  avatars: string[];
  initialContent?: CirclesPageContent;
  createdDate?: string;
  groupId?: string; // Backend group ID for fetching participants
};

const statusConfig: Record<
  CircleStatus,
  {
    badge: string;
    badgeVariant: "default" | "secondary" | "success" | "warning";
    badgeClassName: string;
    alertBg: string;
    alertIcon: typeof AlertCircle;
    alertIconColor: string;
    alertTitle: string;
    alertTitleColor: string;
    buttonBg: string;
    buttonText: string;
    progressColor: string;
    potLabel: string;
    potColor: string;
  }
> = {
  deposit_due: {
    badge: "ACTIVE",
    badgeVariant: "default",
    badgeClassName: "bg-muted/5 text-muted border-0",
    alertBg: "bg-destructive/5 border border-destructive/10",
    alertIcon: AlertCircle,
    alertIconColor: "text-warning",
    alertTitle: "Deposit Due",
    alertTitleColor: "text-warning",
    buttonBg: "bg-warning",
    buttonText: "Pay Now",
    progressColor: "bg-muted",
    potLabel: "Current Pot",
    potColor: "text-muted",
  },
  active: {
    badge: "ACTIVE",
    badgeVariant: "default",
    badgeClassName: "bg-warning/5 text-warning border-0",
    alertBg: "bg-transparent",
    alertIcon: AlertCircle,
    alertIconColor: "text-primary",
    alertTitle: "",
    alertTitleColor: "text-primary",
    buttonBg: "bg-primary",
    buttonText: "View Details",
    progressColor: "bg-warning",
    potLabel: "Current Pot",
    potColor: "text-warning",
  },
  completed: {
    badge: "COMPLETED",
    badgeVariant: "success",
    badgeClassName: "bg-primary/5 text-primary border-0",
    alertBg: "bg-primary/5 border border-primary/10",
    alertIcon: CheckCircle2,
    alertIconColor: "text-primary",
    alertTitle: "Circle Complete!",
    alertTitleColor: "text-primary",
    buttonBg: "bg-primary",
    buttonText: "View Summary",
    progressColor: "bg-primary",
    potLabel: "Final Pot",
    potColor: "text-primary",
  },
};

export function CircleCard({
  address,
  name,
  memberCount,
  weeklyAmount,
  currentWeek,
  totalWeeks,
  currentPot,
  nextPayout,
  lastPayout,
  status,
  avatars,
  initialContent,
  createdDate,
  groupId,
}: CircleCardProps) {
  const { hasOpenedInitialDrawer, setHasOpenedInitialDrawer } =
    usePageContent();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const config = statusConfig[status];
  const progress = (currentWeek / totalWeeks) * 100;

  useEffect(() => {
    if (
      initialContent &&
      initialContent?.circleAddress?.toLowerCase() === address.toLowerCase() &&
      !hasOpenedInitialDrawer
    ) {
      setIsDrawerOpen(true);
      setHasOpenedInitialDrawer(true);
    }
  }, [
    initialContent,
    address,
    hasOpenedInitialDrawer,
    setHasOpenedInitialDrawer,
  ]);

  return (
    <RondaDrawer
      asChild
      contractAddress={address as `0x${string}`}
      createdDate={createdDate}
      groupId={groupId}
      isDrawerOpen={isDrawerOpen}
      memberCount={memberCount}
      name={name}
      setIsDrawerOpen={setIsDrawerOpen}
    >
      <Card className="flex w-full cursor-pointer flex-col gap-6 rounded-[24px] border border-border bg-white p-6 shadow-none">
        {/* Header: Name and Status Badge */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-[18px] text-muted tracking-[-0.45px]">
              {name}
            </h2>
            <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="size-4" strokeWidth={2} />
                <span className="font-normal">{memberCount} members</span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-normal">{weeklyAmount}/week</span>
            </div>
          </div>
          <Badge
            className={cn(
              "h-[29px] rounded-full px-3 py-1.5 font-semibold text-[11px] uppercase tracking-[0.275px]",
              config.badgeClassName
            )}
          >
            {config.badge}
          </Badge>
        </div>

        {/* Alert Section (Deposit Due or Circle Complete) */}
        {(status === "deposit_due" || status === "completed") && (
          <div
            className={cn(
              "flex h-[70px] items-center justify-between gap-4 rounded-2xl p-4",
              config.alertBg
            )}
          >
            <div className="flex items-center gap-3">
              <config.alertIcon
                className={cn("size-5", config.alertIconColor)}
                strokeWidth={2.5}
              />
              <span
                className={cn(
                  "font-semibold text-[14px] tracking-[-0.35px]",
                  config.alertTitleColor
                )}
              >
                {config.alertTitle}
              </span>
            </div>
            <motion.div
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-2xl px-4 py-2 font-semibold text-[12px] text-white",
                config.buttonBg
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Handle button action here (e.g., pay now, view summary)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle button action here (e.g., pay now, view summary)
                }
              }}
              role="button"
              tabIndex={0}
              whileTap={{ scale: 0.98 }}
            >
              {config.buttonText}
            </motion.div>
          </div>
        )}

        {/* Progress Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#6f7780] text-[14px]">
              Progress
            </span>
            <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
              {currentWeek}/{totalWeeks} weeks
            </span>
          </div>
          <Progress
            className="h-2.5 rounded-full bg-[rgba(244,244,245,0.5)]"
            progressBarClassName={cn("rounded-full", config.progressColor)}
            value={progress}
          />
        </div>

        {/* Members and Pot Section */}
        <div className="flex items-end justify-between">
          {/* Member Avatars */}
          <div className="flex items-center pt-2">
            <div className="-space-x-3 flex">
              {avatars.slice(0, 4).map((avatar, index) => (
                <Avatar
                  className="size-9 border-2 border-white"
                  key={`${name}-${index}-${avatar}`}
                >
                  <AvatarImage alt="" src={avatar} />
                  <AvatarFallback className="bg-zinc-100 text-xs">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 4 && (
                <div className="z-10 flex size-9 items-center justify-center rounded-full border-2 border-white bg-zinc-100 font-semibold text-[12px] text-muted-foreground">
                  +{memberCount - 4}
                </div>
              )}
            </div>
          </div>

          {/* Current/Final Pot */}
          <div className="flex flex-col items-end gap-1">
            <span className="font-medium text-[12px] text-muted-foreground tracking-[0.3px]">
              {config.potLabel}
            </span>
            <span
              className={cn(
                "font-bold text-[24px] leading-8 tracking-[-0.6px]",
                config.potColor
              )}
            >
              {currentPot}
            </span>
          </div>
        </div>

        {/* Next/Last Payout */}
        <div className="flex items-center justify-between border-border border-t pt-5">
          <span className="font-medium text-[14px] text-muted-foreground">
            {status === "completed" ? "Last Payout" : "Next Payout"}
          </span>
          <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
            {status === "completed" ? lastPayout : nextPayout}
          </span>
        </div>
      </Card>
    </RondaDrawer>
  );
}
