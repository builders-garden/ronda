import {
  ArrowLeft,
  Calendar,
  Clock,
  type MessageCircle,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RondaStatus } from "@/lib/enum";
import { cn } from "@/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { ProfileCard } from "./profile-card";

type Member = {
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined" | "due" | "skipped" | "paid";
  statusMessage?: string;
};

type Activity = {
  title: string;
  message: string;
  timestamp: string;
  icon: typeof MessageCircle;
  iconBg?: string;
};

type RondaDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  triggerClassName?: string;
  children: React.ReactNode;
  asChild?: boolean;
  // Ronda data
  name?: string;
  memberCount?: number;
  weeklyAmount?: string;
  status?: RondaStatus;
  potAmount?: string;
  nextPayout?: string;
  currentWeek?: number;
  totalWeeks?: number;
  createdDate?: string;
  progress?: number;
  // Deposit due specific
  depositAmount?: string;
  depositDeadline?: Date | string;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
  };
  // Members and activity
  members?: Member[];
  activities?: Activity[];
  // Actions
  onDeposit?: () => void;
  onViewAllMembers?: () => void;
};

function formatCountdown(
  days: number,
  hours: number,
  minutes: number
): {
  days: string;
  hours: string;
  minutes: string;
} {
  return {
    days: `${days}d`,
    hours: `${hours}h`,
    minutes: `${minutes}m`,
  };
}

function useCountdown(deadline?: Date | string) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!deadline) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const target =
        typeof deadline === "string" ? new Date(deadline) : deadline;
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return timeRemaining;
}

export const RondaDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  triggerClassName,
  children,
  asChild,
  name = "Ronda Name",
  memberCount = 12,
  weeklyAmount = "$100/week",
  status = RondaStatus.ACTIVE,
  potAmount = "$600.00",
  nextPayout = "Dec 1st",
  currentWeek = 3,
  totalWeeks = 8,
  createdDate = "Dec 1, 2024",
  progress: progressProp,
  depositAmount = "$50",
  depositDeadline,
  timeRemaining: timeRemainingProp,
  members,
  activities,
  onDeposit,
  onViewAllMembers,
}: RondaDrawerProps) => {
  const countdown = useCountdown(depositDeadline);
  const timeRemaining = timeRemainingProp || countdown;
  const progress =
    progressProp ?? (totalWeeks ? (currentWeek / totalWeeks) * 100 : 0);
  const isDepositDue = status === RondaStatus.DEPOSIT_DUE;
  const isActive = status === RondaStatus.ACTIVE;
  const isCompleted = status === RondaStatus.COMPLETED;

  const countdownFormatted = formatCountdown(
    timeRemaining.days,
    timeRemaining.hours,
    timeRemaining.minutes
  );

  const getStatusBadge = () => {
    if (isDepositDue) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(107,155,122,0.1)] px-3 py-1.5 font-semibold text-[#6b9b7a] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Active
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(107,155,122,0.1)] px-3 py-1.5 font-semibold text-[#6b9b7a] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Active
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(123,143,245,0.1)] px-3 py-1.5 font-semibold text-[#7b8ff5] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Completed
        </Badge>
      );
    }
    return null;
  };

  return (
    <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
      <DrawerTrigger
        asChild={asChild}
        className={cn(
          "w-full cursor-pointer focus:outline-none",
          triggerClassName
        )}
      >
        {children}
      </DrawerTrigger>
      <DrawerContent className="w-full rounded-none border-none focus:outline-none">
        <DrawerHeader className="hidden">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>
        <div className="flex h-[69px] w-full items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-4">
          <motion.button
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[rgba(244,244,245,0.5)]"
            onClick={() => setIsDrawerOpen(false)}
            type="button"
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="size-6 text-zinc-950" strokeWidth={2} />
          </motion.button>
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold text-[18px] text-zinc-950 tracking-[-0.45px]">
              {name}
            </span>
            <span className="text-[#6f7780] text-[12px]">
              {memberCount} members • {weeklyAmount}
            </span>
          </div>
          <div className="size-11 shrink-0 rounded-full bg-transparent" />
        </div>

        <ScrollArea
          className={cn(
            "w-full",
            isDepositDue ? "h-[calc(100vh-69px-80px)]" : "h-[calc(100vh-69px)]"
          )}
          scrollBarClassName="opacity-0 w-0"
        >
          <div className="flex w-full flex-col gap-6 px-4 py-6">
            <Card className="flex w-full flex-col gap-6 rounded-[24px] border border-[rgba(232,235,237,0.5)] bg-white p-6 shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-[18px] text-zinc-950 tracking-[-0.45px]">
                    {name}
                  </h2>
                  <div className="flex items-center gap-2 text-[#6f7780] text-[12px]">
                    <Calendar className="size-3.5" strokeWidth={2} />
                    <span className="font-normal">Created {createdDate}</span>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {potAmount}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Pot Amount
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {nextPayout}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Next Payout
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {currentWeek}/{totalWeeks}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Weeks
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#6f7780] text-[14px]">
                    Progress
                  </span>
                  <span className="font-normal text-[#6f7780] text-[12px]">
                    {weeklyAmount} per member, per week
                  </span>
                </div>
                <Progress
                  className="h-2.5 rounded-full bg-[rgba(244,244,245,0.5)]"
                  progressBarClassName="bg-[#7b8ff5] rounded-full"
                  value={progress}
                />
              </div>

              {/* Deposit Deadline Card */}
              {isDepositDue && (
                <div className="flex flex-col gap-4 rounded-2xl border border-[rgba(245,158,66,0.3)] bg-gradient-to-b from-[rgba(245,158,66,0.2)] to-[rgba(245,158,66,0.05)] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="size-5 text-zinc-950" strokeWidth={2} />
                      <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
                        Deposit Deadline
                      </span>
                    </div>
                    <Badge
                      className="rounded-full border-none bg-[rgba(245,158,66,0.2)] px-2 py-1 font-bold text-[#f59e42] text-[10px] uppercase tracking-[0.25px]"
                      variant="outline"
                    >
                      Urgent
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[#f59e42] text-[36px] leading-[40px] tracking-[-0.9px]">
                      {countdownFormatted.days} {countdownFormatted.hours}
                    </span>
                    <span className="font-semibold text-[18px] text-[rgba(245,158,66,0.7)] leading-[28px] tracking-[-0.45px]">
                      {countdownFormatted.minutes}
                    </span>
                  </div>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Time remaining to deposit {depositAmount} for this week
                  </span>
                </div>
              )}
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[16px] text-zinc-950 tracking-[-0.4px]">
                Members
              </h2>
              <motion.button
                className="cursor-pointer font-semibold text-[12px] text-zinc-900 tracking-[-0.3px] hover:underline"
                onClick={onViewAllMembers}
                whileTap={{ scale: 0.98 }}
              >
                View all {memberCount} members
              </motion.button>
            </div>

            <div className="flex w-full flex-col gap-2">
              {members && members.length > 0 ? (
                members.map((member, index) => (
                  <ProfileCard
                    avatar={member.avatar}
                    key={`${member.name}-${member.avatar}-${index}`}
                    name={member.name}
                    status={member.status}
                    statusMessage={member.statusMessage || ""}
                  />
                ))
              ) : (
                <>
                  <ProfileCard
                    avatar="https://github.com/shadcn.png"
                    name="You"
                    status={isDepositDue ? "due" : "accepted"}
                    statusMessage={
                      isDepositDue ? "Due weekly deposit" : "Paid this week"
                    }
                  />
                  <ProfileCard
                    avatar="https://github.com/shadcn.png"
                    name="Alex R."
                    status="accepted"
                    statusMessage="Paid this week"
                  />
                </>
              )}
            </div>

            {activities && activities.length > 0 && (
              <>
                <div className="flex items-center justify-start">
                  <h2 className="font-bold text-[16px] text-zinc-950 tracking-[-0.4px]">
                    Recent Activity
                  </h2>
                </div>
                <div className="flex w-full flex-col gap-4">
                  {activities.map((activity, index) => (
                    <div
                      className="flex items-start justify-between gap-2"
                      key={`activity-${activity.title}-${activity.timestamp}-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-2xl",
                            activity.iconBg || "bg-[rgba(107,155,122,0.1)]"
                          )}
                        >
                          <activity.icon
                            className="size-5 text-zinc-950"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex flex-col items-start justify-center">
                          <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
                            {activity.title}
                          </span>
                          <span className="font-normal text-[#6f7780] text-[12px]">
                            {activity.message}
                          </span>
                        </div>
                      </div>
                      <span className="font-normal text-[#6f7780] text-[12px]">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Deposit Button for Deposit Due State */}
        {isDepositDue && (
          <div className="flex w-full border-[rgba(232,235,237,0.5)] border-t bg-white p-4">
            <Button
              className="h-16 w-full cursor-pointer rounded-[24px] bg-[#f59e42] font-semibold text-[16px] text-white tracking-[-0.4px] shadow-[0px_4px_6px_-4px_rgba(245,158,66,0.3),0px_10px_15px_-3px_rgba(245,158,66,0.3)] hover:bg-[#f59e42]/90"
              onClick={onDeposit}
            >
              <Wallet className="mr-2 size-5" strokeWidth={2} />
              Deposit {depositAmount} Now
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
