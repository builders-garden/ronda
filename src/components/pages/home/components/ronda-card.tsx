import {
  CheckCircle2,
  type LucideIcon,
  MessageCircleWarning,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { RondaDrawer } from "@/components/shared/ronda-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RondaStatus } from "@/lib/enum";
import { cn } from "@/utils";

type RondaCardProps = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  currentWeek: number;
  totalWeeks: number;
  status: RondaStatus;
  avatars: string[];
  onDeposit?: () => void;
};

const statusConfig: Record<
  RondaStatus,
  {
    badge: string;
    badgeColor: string;
    iconColor: string;
    bgIconColor: string;
    progressColor: string;
    progressBackgroundColor: string;
    statusMessageTitle: string;
    statusMessageTitleColor: string;
    statusMessage: string;
    statusIcon: LucideIcon;
  }
> = {
  [RondaStatus.DEPOSIT_DUE]: {
    badge: "Deposit Due",
    badgeColor: "bg-warning/10 text-warning border-warning/20",
    iconColor: "text-success",
    bgIconColor: "bg-success/10",
    progressColor: "bg-primary",
    progressBackgroundColor: "bg-primary/20",
    statusMessageTitleColor: "text-warning",
    statusMessageTitle: "Deposit Required",
    statusMessage: "Make your $50 deposit by Dec 15",
    statusIcon: MessageCircleWarning,
  },
  [RondaStatus.ACTIVE]: {
    badge: "Active",
    badgeColor: "bg-success/10 text-success border-success/20",
    iconColor: "text-primary",
    bgIconColor: "bg-primary/10",
    progressColor: "bg-primary",
    progressBackgroundColor: "bg-primary/20",
    statusMessageTitleColor: "text-secondary",
    statusMessageTitle: "Pending Contributions",
    statusMessage: "Waiting on 2 people to deposit",
    statusIcon: MessageCircleWarning,
  },
  [RondaStatus.COMPLETED]: {
    badge: "Completed",
    badgeColor: "bg-success/10 text-success border-success/20",
    iconColor: "text-secondary",
    bgIconColor: "bg-secondary/10",
    progressColor: "bg-success-foreground",
    progressBackgroundColor: "bg-success-foreground/20",
    statusMessageTitleColor: "text-success-foreground",
    statusMessageTitle: "Your Ronda is complete!",
    statusMessage: "You hit your savings goal",
    statusIcon: CheckCircle2,
  },
};

export function RondaCard({
  name,
  memberCount,
  weeklyAmount,
  currentWeek,
  totalWeeks,
  status,
  avatars,
  onDeposit,
}: RondaCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const config = statusConfig[status];
  const progress = (currentWeek / totalWeeks) * 100;

  return (
    <Card
      className={cn(
        "flex w-full flex-col items-center justify-start gap-4 rounded-md border-none p-4 drop-shadow-sm",
        status === RondaStatus.DEPOSIT_DUE && "ring-2 ring-warning"
      )}
    >
      <RondaDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      >
        <div className="flex w-full flex-col items-center justify-center gap-4">
          {/* Ronda Name and Member Count */}
          <div className="flex w-full items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-full",
                  config.bgIconColor,
                  config.iconColor
                )}
              >
                <Users className="size-6" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="font-semibold text-base text-muted">
                  {name}
                </span>
                <span className="text-gray-600 text-xs">
                  {memberCount} members • {weeklyAmount}/week
                </span>
              </div>
            </div>
            <Badge
              className={cn(
                "border-none px-2 py-1 font-medium text-xs",
                config.badgeColor
              )}
              variant="outline"
            >
              {config.badge}
            </Badge>
          </div>

          {/* Progress */}
          <div className="flex w-full flex-col items-start justify-start gap-2">
            <div className="flex w-full items-center justify-between text-muted text-sm">
              <span>Progress</span>
              <span className="font-semibold">
                {currentWeek} of {totalWeeks} weeks
              </span>
            </div>
            <Progress
              className={cn("h-2", config.progressBackgroundColor)}
              progressBarClassName={config.progressColor}
              value={progress}
            />
          </div>

          {/* User Avatar List */}
          <div className="flex w-full items-center justify-start">
            <div className="-space-x-2 flex">
              {avatars.slice(0, 3).map((avatar, index) => (
                <Avatar
                  className="size-7 border-[1.5px] border-foreground"
                  key={`${name}-${index}-${avatar}`}
                >
                  <AvatarImage alt="" src={avatar} />
                  <AvatarFallback className="bg-gray-200 text-xs">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <div className="z-10 flex size-7 items-center justify-center rounded-full border-[1.5px] border-foreground bg-gray-200 text-xs">
                  +{memberCount - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </RondaDrawer>

      {/* Status Message */}
      {config.statusMessage && (
        <div
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md p-4",
            status === RondaStatus.DEPOSIT_DUE
              ? "bg-warning/10"
              : status === RondaStatus.ACTIVE
                ? "bg-purple-50"
                : "bg-success-foreground/10"
          )}
        >
          {config.statusIcon && (
            <config.statusIcon
              className={cn(
                "size-6",
                status === RondaStatus.DEPOSIT_DUE
                  ? "text-warning"
                  : status === RondaStatus.ACTIVE
                    ? "text-secondary"
                    : "text-success-foreground"
              )}
            />
          )}
          <div className="flex flex-col items-start justify-start">
            <h3 className={cn("font-medium", config.statusMessageTitleColor)}>
              {config.statusMessageTitle}
            </h3>
            <span className="text-muted-foreground text-sm">
              {config.statusMessage}
            </span>
          </div>
        </div>
      )}

      {/* Deposit Button */}
      {status === RondaStatus.DEPOSIT_DUE && (
        <motion.button
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-warning px-4 py-2 font-medium text-foreground shadow-lg shadow-warning/20 hover:bg-warning/90"
          onClick={onDeposit}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="size-4.5" strokeWidth={2} />
          Deposit Now
        </motion.button>
      )}
    </Card>
  );
}
