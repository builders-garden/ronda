import { ArrowLeft, Calendar, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProfileCard } from "@/components/shared/profile-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type InvitationCardProps = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  totalWeeks?: number;
  dueDate?: string;
  avatars: string[];
  potAmount?: string;
  nextPayout?: string;
  currentWeek?: number;
  createdDate?: string;
  onAccept?: () => void;
  onDecline?: () => void;
};

export function InvitationCard({
  name,
  memberCount,
  weeklyAmount,
  totalWeeks,
  dueDate,
  avatars,
  potAmount,
  nextPayout,
  currentWeek,
  createdDate,
  onAccept,
  onDecline,
}: InvitationCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const progress =
    totalWeeks && currentWeek ? (currentWeek / totalWeeks) * 100 : 0;
  const potAmountValue = potAmount || "$0.00";
  const nextPayoutValue = nextPayout || dueDate || "N/A";
  const weeksValue = totalWeeks ? `${currentWeek || 0}/${totalWeeks}` : "N/A";

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.();
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.();
  };

  return (
    <Card className="flex w-full flex-col gap-4 rounded-[24px] border border-border bg-white p-6 shadow-none">
      <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
        <DrawerTrigger
          asChild
          className="w-full cursor-pointer focus:outline-none"
        >
          <div className="flex flex-col gap-4">
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
              <div className="-space-x-3 flex items-center">
                {avatars.slice(0, 3).map((avatar, index) => (
                  <Avatar
                    className="size-7 border-2 border-white"
                    key={`${name}-${index}-${avatar}`}
                  >
                    <AvatarImage alt="" src={avatar} />
                    <AvatarFallback className="bg-zinc-100 text-[10px]">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {memberCount > 3 && (
                  <div className="z-10 flex size-7 items-center justify-center rounded-full border-2 border-white bg-zinc-100 font-semibold text-[#6f7780] text-[10px]">
                    +{memberCount - 3}
                  </div>
                )}
              </div>
            </div>

            {(totalWeeks || dueDate) && (
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                {totalWeeks && (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" strokeWidth={2} />
                      <span className="font-medium">{totalWeeks} weeks</span>
                    </div>
                    <span className="text-muted-foreground/40">•</span>
                  </>
                )}
                {dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" strokeWidth={2} />
                    <span className="font-medium">Due {dueDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full rounded-none border-none focus:outline-none">
          <DrawerHeader className="hidden">
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>
          <div className="flex h-[69px] w-full items-center justify-between border-border border-b bg-white px-4">
            <motion.button
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[rgba(244,244,245,0.5)]"
              onClick={() => setIsDrawerOpen(false)}
              type="button"
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="size-6 text-zinc-950" strokeWidth={2} />
            </motion.button>
            <div className="flex flex-col items-center justify-center">
              <span className="font-bold text-[18px] text-muted tracking-[-0.45px]">
                {name}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {memberCount} members • {weeklyAmount}/week
              </span>
            </div>
            <div className="size-11 shrink-0 rounded-full bg-transparent" />
          </div>

          <ScrollArea
            className="h-[calc(100vh-69px-150px)] w-full"
            scrollBarClassName="opacity-0 w-0"
          >
            <div className="flex w-full flex-col gap-6 px-4 py-6">
              <Card className="flex w-full flex-col gap-6 rounded-[24px] border border-border bg-white p-6 shadow-none">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-[18px] text-muted tracking-[-0.45px]">
                      {name}
                    </h2>
                    {createdDate && (
                      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <Calendar className="size-3.5" strokeWidth={2} />
                        <span className="font-normal">
                          Created {createdDate}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge
                    className="h-[29px] rounded-full border-none bg-[rgba(245,158,66,0.1)] px-3 py-1.5 font-semibold text-[#f59e42] text-[11px] uppercase tracking-[0.275px]"
                    variant="outline"
                  >
                    Pending Invitation
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                      {potAmountValue}
                    </span>
                    <span className="font-medium text-[#6f7780] text-[12px]">
                      Pot Amount
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                      {nextPayoutValue}
                    </span>
                    <span className="font-medium text-[#6f7780] text-[12px]">
                      Next Payout
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                      {weeksValue}
                    </span>
                    <span className="font-medium text-[#6f7780] text-[12px]">
                      Weeks
                    </span>
                  </div>
                </div>

                {totalWeeks && (
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
                      className="h-2.5 bg-[rgba(244,244,245,0.5)]"
                      progressBarClassName="bg-[#7b8ff5]"
                      value={progress}
                    />
                  </div>
                )}
              </Card>

              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[16px] text-zinc-950 tracking-[-0.4px]">
                  Members
                </h2>
                <motion.button
                  className="cursor-pointer font-semibold text-[12px] text-zinc-900 tracking-[-0.3px] hover:underline"
                  whileTap={{ scale: 0.98 }}
                >
                  View all {memberCount} members
                </motion.button>
              </div>

              <div className="flex w-full flex-col gap-2">
                {avatars.slice(0, 4).map((avatar, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <ProfileCard
                      avatar={avatar}
                      key={`${name}-member-${avatar}`}
                      name={isFirst ? "You" : `Member ${idx + 1}`}
                      status="pending"
                      statusMessage="Pending Invite"
                    />
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          <div className="flex w-full flex-col gap-3 border-[rgba(232,235,237,0.5)] border-t bg-white p-4">
            <Button
              className="h-16 w-full cursor-pointer rounded-[24px] bg-[#7b8ff5] font-semibold text-[16px] text-white tracking-[-0.4px] shadow-[0px_4px_6px_-4px_rgba(123,143,245,0.3),0px_10px_15px_-3px_rgba(123,143,245,0.3)] hover:bg-[#7b8ff5]/90"
              onClick={handleAccept}
            >
              Accept Invitation
            </Button>
            <Button
              className="h-[58px] w-full cursor-pointer rounded-[24px] border border-[#e8ebed] bg-zinc-100 font-semibold text-[16px] text-zinc-950 tracking-[-0.4px] hover:bg-zinc-200"
              onClick={handleDecline}
              variant="outline"
            >
              Decline
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="flex gap-3">
        <Button
          className="h-14 flex-1 cursor-pointer rounded-2xl bg-zinc-900 font-semibold text-[16px] text-white tracking-[-0.4px] hover:bg-zinc-800"
          onClick={handleAccept}
        >
          Accept
        </Button>
        <Button
          className="h-14 flex-1 cursor-pointer rounded-2xl bg-zinc-100 font-semibold text-[16px] text-zinc-950 tracking-[-0.4px] hover:bg-zinc-200"
          onClick={handleDecline}
          variant="outline"
        >
          Decline
        </Button>
      </div>
    </Card>
  );
}
