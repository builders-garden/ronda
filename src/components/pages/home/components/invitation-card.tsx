import { useState } from "react";
import { RondaDrawer } from "@/components/shared/ronda-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InvitationCardProps = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  avatars: string[];
  onAccept?: () => void;
  onDecline?: () => void;
};

export function InvitationCard({
  name,
  memberCount,
  weeklyAmount,
  avatars,
  onAccept,
  onDecline,
}: InvitationCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Card className="flex w-full flex-row items-center justify-between gap-3 rounded-md border-none p-3 drop-shadow-sm">
      <RondaDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      >
        <div className="flex flex-col items-start justify-center gap-1">
          <span className="font-medium text-muted text-sm">{name}</span>

          <div className="flex items-center justify-start gap-2">
            <div className="-space-x-2 flex">
              {avatars.slice(0, 3).map((avatar, index) => (
                <Avatar
                  className="size-6 border-[1.5px] border-foreground"
                  key={`${name}-${index}-${avatar}`}
                >
                  <AvatarImage alt="" src={avatar} />
                  <AvatarFallback className="bg-gray-200 text-xs">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <div className="z-10 flex size-6 items-center justify-center rounded-full border-[1.5px] border-foreground bg-gray-200 text-xs">
                  +{memberCount - 3}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
              <span>•</span>
              <span>{weeklyAmount}/week</span>
            </div>
          </div>
        </div>
      </RondaDrawer>

      <div className="flex gap-2">
        <Button
          className="h-6 bg-success px-2 text-xs hover:bg-success/90"
          onClick={onAccept}
          size="sm"
        >
          Accept
        </Button>
        <Button
          className="h-6 border-border bg-white px-2 text-xs hover:bg-gray-50"
          onClick={onDecline}
          size="sm"
          variant="outline"
        >
          Decline
        </Button>
      </div>
    </Card>
  );
}
