import { Calendar, Users } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { RondaDrawer } from "@/components/shared/ronda-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RondaStatus } from "@/lib/enum";

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
  groupId?: string;
  contractAddress?: Address;
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
  groupId,
  contractAddress,
  onAccept,
  onDecline,
}: InvitationCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.();
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.();
  };

  return (
    <RondaDrawer
      asChild
      contractAddress={contractAddress}
      createdDate={createdDate}
      currentWeek={currentWeek}
      groupId={groupId}
      isDrawerOpen={isDrawerOpen}
      memberCount={memberCount}
      name={name}
      nextPayout={nextPayout}
      potAmount={potAmount}
      setIsDrawerOpen={setIsDrawerOpen}
      status={RondaStatus.ACTIVE}
      totalWeeks={totalWeeks}
      weeklyAmount={weeklyAmount}
    >
      <Card className="flex w-full flex-col gap-4 rounded-[24px] border border-border bg-white p-6 shadow-none">
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
                  <AvatarFallback className="bg-muted/5 text-[10px]">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <div className="z-10 flex size-7 items-center justify-center rounded-full border-2 border-white bg-muted/5 font-semibold text-[10px] text-muted-foreground">
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

        <div className="flex gap-3">
          <Button
            className="h-14 flex-1 cursor-pointer rounded-2xl bg-primary font-semibold text-[16px] text-white tracking-[-0.4px] hover:bg-primary/90"
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
    </RondaDrawer>
  );
}
